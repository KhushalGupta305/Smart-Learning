$(document).ready(function() {

    setup_ajax();
    init_lesson_stats();
    set_active_language();

});


// Setup AJAX with CSRF and crossdomain protection
// https://docs.djangoproject.com/en/dev/ref/contrib/csrf/
setup_ajax = function() {

    $.ajaxSetup({
        crossDomain: false,
        beforeSend: function(xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type)) {
                xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
            }
        }
    });

};


// Inititalize events and handlers for gathering statistics for lesson usage
// Events: CLICK, VIEW, PLAY, DURATION
init_lesson_stats = function() {

    // AJAX callback helper for lesson stats
    var post_lesson_event = function(url, pk) { $.post(url, {'lesson_pk': pk}); };

    // Lesson CLICK
    $(document).on('click', '*[data-handler="lesson_clicked"]', function() {
        $.cookie('lesson_clicked', $(this).data('lesson-pk'), { path: '/' });
    });

    // Lesson VIEW, PLAY, DURATION
    var lesson_container = $('*[data-handler="lesson_viewed"]');
    if (lesson_container.length == 1) {

        // interval settings in milliseconds
        const PLAY_START_BUFFER = 60000;
        const PLAY_INCREMENT_INTERVAL = 30000;

        // local vars used in helper-functions
        var lesson_pk = lesson_container.data('lesson-pk');
        var playtime_url = 'stats/lesson/play/time/index.html';

        // helper functions for calling ajax posts (playtime in seconds)
        var post_viewed = function() { post_lesson_event('stats/lesson/view/index.html', lesson_pk); };
        var post_played = function() { post_lesson_event('stats/lesson/play/index.html', lesson_pk); };
        var post_playtime_played = function() { post_lesson_event(playtime_url+PLAY_START_BUFFER/1000+'/', lesson_pk); };
        var post_playtime_playing = function() { post_lesson_event(playtime_url+PLAY_INCREMENT_INTERVAL/1000+'/', lesson_pk); };

        // Lesson VIEW - registered on page load
        var handle_viewed = function() {
            post_viewed();
            window.setTimeout(handle_played, PLAY_START_BUFFER);
        };

        // Lesson PLAY - registered after VIEW and 60 seconds
        var handle_played = function() {
            post_played();
            handle_playtime();
        };

        // Lesson DURATION - keeps registering after PLAY and each 30 seconds
        var handle_playtime = function() {
            post_playtime_played();
            window.setInterval(post_playtime_playing, PLAY_INCREMENT_INTERVAL);
        };

        // start off the chain by calling VIEW
        handle_viewed();
    }

};


// Set css class for active language from cookie
set_active_language = function() {

    var language_selected = $('a.language-'+$.cookie('selected_language'));

    if (language_selected) {
        language_selected.parent().addClass('active');
    }

};
