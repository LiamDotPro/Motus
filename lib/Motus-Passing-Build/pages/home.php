<div class="container-fluid">
    <div class="container">
        <div class="row home-pane-panel ">
            <div class="col-xs-3 home-pane-user nopad">
                <div class="col-md-12 user-tile-col">
                    <div class="user-tile">
                        <div class="user-thumbnail">   
                            <img src="/images/default/thumbnail/default-thumbnail-wallpaper.jpg" alt="Add some flair to your news profile">
                        </div>
                        <div class="user-stats text-center row">
                            <div class="col-md-12"><h5><i class="fa fa-calendar"></i> <span id="datetime"></span></h5></div>
                        </div>
                        <div class="user-info text-center">
                            <h3>Anonymous</h3>
                            <p id="loc"><p>
                            <p id="ip"></p>
                        </div>
                        <div class="user-actions text-center">
                            <a class="btn btn-action" href="">Register</a>
                            <a class="btn btn-action" href="">Sign in</a>
                        </div>
                    </div>
                </div>

                <div class="col-md-12 user-reading-col">
                    <div class="user-tile">
                        <div class="text-center">
                            <h3>Your pinned articles</h3>
                        </div>
                        <div class="pinned-articles">
                            <ul>
                                <li><a href="">Hello World</a> <p> - A short introduction to life</p></li>
                                <li><a href="">Hello World</a> <p> - A short introduction to life</p></li>
                                <li><a href="">Hello World</a> <p> - A short introduction to life</p></li>
                                <li><a href="">Hello World</a> <p> - A short introduction to life</p></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xs-9 home-pane-main nopad">
                <div></div>
            </div>
        </div>
    </div>
</div>

<script>

    var datetime = null,
            date = null;
    var update = function () {
        date = moment(new Date());
        datetime.html(date.format('MMMM Do YYYY h:mm a'));
    };

    $(document).ready(function () {
        datetime = $('#datetime')
        update();
        setInterval(update, 1000);
    });

    $.get("http://ipinfo.io", function (response) {
        $("#ip").html(response.ip);
        $("#loc").html(response.city + ", " + response.region);
    }, "jsonp");
</script>

