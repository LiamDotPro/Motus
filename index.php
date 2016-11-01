<?php
//start session
session_start();

//errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//better print functionality
function print_r2($val) {
    echo '<pre>';
    print_r($val);
    echo '</pre>';
}

//memory usage indicator
function echo_memory_usage() {
    $mem_usage = memory_get_usage(true);
    if ($mem_usage < 1024)
        echo $mem_usage . " bytes";
    elseif ($mem_usage < 1048576)
        echo round($mem_usage / 1024, 2) . " kilobytes";
    else
        echo round($mem_usage / 1048576, 2) . " megabytes";
    echo "<br/>";
}

//load in database
require_once "includes/Database.php";

//check to see if a user is actively logged into the website
if (isset($_SESSION['active_user'])) {
    
}

//defines the real path of the server
define('ROOT', realpath($_SERVER["DOCUMENT_ROOT"]));
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Motus is a news sharing website that personalises itself to the user not the audience.">
        <meta property="og:description" content="Motus is a news sharing website that personalises itself to the user not the audience." />
        <meta property="og:image" content="preview.jpg" />
        <meta name="author" content="Liam Read">
        <link rel="icon" type="image/png" href="/favicon.png">

        <!-- Custom Meta title tags -->
        <meta property="og:title" content="Motus - Very Personal News" />
        <title>Motus - Very Personal News</title>
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" type="text/css" rel="stylesheet">
        <link href="/css/style.css" rel="stylesheet">
        <!--[if lt IE 9]>
          <script src="http://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
          <script src="http://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]--> 


        <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js" type="text/javascript"></script>
        <script src="http://cdnjs.cloudflare.com/ajax/libs/list.js/1.1.0/list.min.js"></script>

        <!--        Google Analytics-->
        <script>

        </script>
        <?php
        //gets the page the person is requesting
        if (isset($_GET['page'])) {
            $pagetitle = strtolower(trim($_GET['page']));
        }
        ?>
    </head>
    <body>
        <header>
            <nav class="navbar navbar-lg main-navbar" role="navigation" id="top-navigation">
                <div class="container">
                    <div class="row">
                        <!-- Mobile Only -->
                        <div class="navbar-header"> 
                            <img src="/images/logos/logo.png" class="img-responsive pull-left hidden-lg logo-xs" alt="logo here">
                            <button type="button" class="navbar-toggle pull-right"> 
                                <span class="sr-only">Toggle navigation</span>
                                <span class="nav-menu-line"></span>
                                <span class="nav-menu-line"></span>
                                <span class="nav-menu-line"></span>
                            </button>
                        </div>
                        <!-- Main Navigation -->
                        <div class="collapse navbar-collapse" id="main-nav">
                            <ul class="nav main-links navbar-nav navbar-left">
                                <li><a href="/home">Home</a></li>
                            </ul>
                            <ul class="nav social-links navbar-nav navbar-right">
                                <li><a target="_blank" class="facebook" href=""><i class="fa fa-facebook"></i></a></li>
                                <li><a target="_blank" class="youtube" href=""><i class="fa fa-youtube-play"></i></a></li>
                                <li><a target="_blank" class="twitch" href=""><i class="fa fa-twitch"></i></a></li>
                                <li><a target="_blank" class="twitter" href=""><i class="fa fa-twitter"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
        <div class="page-wrapper">
            <!-- PAGE CONTENT -->
            <?php
            if (isset($_GET['page'])) {
                $page = $_GET['page'];
                switch ($page) {
                    case 'home':
                    case '404':
                        if (file_exists(ROOT . "/pages/" . $page . ".php")) {
                            // Route and file was found on the system
                            include_once(ROOT . "/pages/" . $_GET['page'] . ".php");
                        } else {
                            // Route was found, but no file on the system exists
                            include("pages/404.php");
                        }
                        break;
                    default:
                        include("pages/404.php");
                        break;
                }
            } else {
                // Page variable is not set, throw homepage 
                include(ROOT . "/pages/home.php");
            }
            ?>
            <!-- FOOTER SECTION -->
            <section class="footer-section">
                <footer class="container">
                    <div class="row footer-top">


                    </div>
                </footer>
            </section>
        </div>
        <!--- /PAGE WRAPPER  --->

        <!-- Custom Google Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Raleway" rel="stylesheet"> 
        <!-- Bootstrap -->
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" type="text/javascript"></script>
        <!-- Animate.css -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.1/animate.min.css" type="text/css" rel="stylesheet">
        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
    </body>
</html>