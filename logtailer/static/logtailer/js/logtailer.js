/*
 * Logtailer object
 */

var LogTailer = {
	timeout_id: null,
	timeout: 2000,
	scroll: true,
	file_id: 0,
	first_read: true,
	highlight: true,
	max_lines: 500
};
var _highlight = function(str, pattern, custom_class='log-highlight'){
	let matched_text = str.match(pattern)[0];
	return str.replace(matched_text, '<span class="' + custom_class + '">' + matched_text +  '</span>')
};
LogTailer.getLines = function (){
	LogTailer.currentScrollPosition = django.jQuery("#log-window").scrollTop();
	django.jQuery.ajax({
	  url: LOGTAILER_URL_GETLOGLINE,
	  success: function(result){
	  				LogTailer.printLines(result);
	  		   },
	  dataType: "json"
	});
}

LogTailer.getHistory = function ( callback ){
	LogTailer.currentScrollPosition = django.jQuery("#log-window").scrollTop();
	django.jQuery.ajax({
	  url: LOGTAILER_URL_GETHISTORY,
	  success: function(result){
	  				LogTailer.printLines(result);
                    callback && callback();
	  		   },
	  dataType: "json"
	});

};

LogTailer.printLines = function(result, keep_reading=true){
	let logWindow = django.jQuery("#log-window");
	if(django.jQuery("#apply-filter").is(':checked')){
		for(var i=0;i<result.length;i++){
			let res = decodeURIComponent(result[i])
			pattern = django.jQuery("#filter").val();
			if(django.jQuery('#filter-select').val()!="custom"){
				pattern = django.jQuery('#filter-select').val();
			}
			try {
			    regex = eval(pattern);
			}
			catch(err) {
			    regex = pattern;
			}
			position = res.search(regex);
			if(position>-1){
				logWindow.append(LogTailer.highlight ? _highlight(res, regex) : res);
			}
		}
	}
	else{
		for(var i=0;i<result.length;i++){
			if(result[i].length>0){
				logWindow.append(decodeURIComponent(result[i]));
			}
		}
	}
	if(LogTailer.scroll && result.length){
		logWindow.scrollTop(logWindow[0].scrollHeight - logWindow.height());
	}
	else{
		logWindow.scrollTop(LogTailer.currentScrollPosition);
	}
	window.clearTimeout(LogTailer.timeout_id);
	if (keep_reading) LogTailer.timeout_id = window.setTimeout("LogTailer.getLines("+LogTailer.file_id+")", LogTailer.timeout);
}

LogTailer.startReading = function (){
    if (LogTailer.first_read) {
        LogTailer.first_read = false;
        LogTailer.getHistory( function(){
            LogTailer.timeout_id = window.setTimeout("LogTailer.getLines("+LogTailer.file_id+")", LogTailer.timeout);
        });
    } else {
        LogTailer.timeout_id = window.setTimeout("LogTailer.getLines("+LogTailer.file_id+")", LogTailer.timeout);
    }
	django.jQuery("#start-button").hide();
	django.jQuery("#stop-button").show();
}

LogTailer.stopReading = function (){
	window.clearTimeout(LogTailer.timeout_id);
	django.jQuery("#stop-button").hide();
	django.jQuery("#start-button").show();
};

LogTailer.readingHistory = function (){
	LogTailer.currentScrollPosition = django.jQuery("#log-window").html("").scrollTop();
	django.jQuery.ajax({
	  url: LOGTAILER_URL_FINDHISTORY,
	  success: function(result){
	  				LogTailer.printLines(result, keep_reading=false);
	  		   },
	  dataType: "json"
	});
};

LogTailer.changeAutoScroll = function(){
	if(LogTailer.scroll){
      	LogTailer.scroll = false;
      	django.jQuery('#auto-scroll').val("OFF").css('color', 'mediumvioletred');
    }
    else{
      	LogTailer.scroll = true;
      	django.jQuery('#auto-scroll').val("ON").css('color', '#fff');
    }
}

LogTailer.customFilter = function(){
	if(django.jQuery('#filter-select').val()==="custom"){
	    django.jQuery('#filter').show();
	}
	else{
		django.jQuery('#filter').hide();
	}
};
