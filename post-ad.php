<?php
	session_start();
	ob_start();
?>

<html>
<head>
<meta charset="utf-8" />
<title>Post on Ajuwaya Market[soon to be Your account on Ajuwaya Market]</title>
<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href="css/bootstrap-select.css">
<link href="css/style.css" rel="stylesheet" type="text/css" media="all" />
<!-- for-mobile-apps -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="Buy from Corpers. Sell to Corpers. By Corpers. From all over Nigeria." />
<script type="application/x-javascript"> addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false); function hideURLbar(){ window.scrollTo(0,1); } </script>
<!-- //for-mobile-apps -->
<!--fonts-->
<link href='//fonts.googleapis.com/css?family=Ubuntu+Condensed' rel='stylesheet' type='text/css'>
<link href='//fonts.googleapis.com/css?family=Open+Sans:400,300,300italic,400italic,600,600italic,700,700italic,800,800italic' rel='stylesheet' type='text/css'>
<!--//fonts-->	
<!-- js -->
<script type="text/javascript" src="js/jquery.min.js"></script>
<!-- js -->
<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<script src="js/bootstrap.min.js"></script>
<script src="js/bootstrap-select.js"></script>
<script>
  $(document).ready(function () {
    var mySelect = $('#first-disabled2');

    $('#special').on('click', function () {
      mySelect.find('option:selected').prop('disabled', true);
      mySelect.selectpicker('refresh');
    });

    $('#special2').on('click', function () {
      mySelect.find('option:disabled').prop('disabled', false);
      mySelect.selectpicker('refresh');
    });

    $('#basic2').selectpicker({
      liveSearch: true,
      maxOptions: 1
    });
  });
</script>
<script type="text/javascript" src="js/jquery.leanModal.min.js"></script>
<link href="css/jquery.uls.css" rel="stylesheet"/>
<link href="css/jquery.uls.grid.css" rel="stylesheet"/>
<link href="css/jquery.uls.lcd.css" rel="stylesheet"/>
<!-- Source -->
<script src="js/jquery.uls.data.js"></script>
<script src="js/jquery.uls.data.utils.js"></script>
<script src="js/jquery.uls.lcd.js"></script>
<script src="js/jquery.uls.languagefilter.js"></script>
<script src="js/jquery.uls.regionfilter.js"></script>
<script src="js/jquery.uls.core.js"></script>
<script>
			$( document ).ready( function() {
				$( '.uls-trigger' ).uls( {
					onSelect : function( language ) {
						var languageName = $.uls.data.getAutonym( language );
						$( '.uls-trigger' ).text( languageName );
					},
					quickList: ['en', 'hi', 'he', 'ml', 'ta', 'fr'] //FIXME
				} );
			} );
		</script>
		<link rel="stylesheet" type="text/css" href="css/easy-responsive-tabs.css " />
    <script src="js/easyResponsiveTabs.js"></script>
</head>
<body>
<div class="header">
		<div class="container">
			<div class="logo">
				<a href="index.html"><span>Ajuwaya</span>Market</a>
			</div>
			<div class="header-right">
			<a class="account" href="login.html">My Account</a>
			<span class="active uls-trigger">Select language</span>

		</div>
		</div>
	</div>
	<div class="main-banner banner text-center">
	  <div class="container">    
			<h1>Buy or Sell   <span class="segment-heading">    anything online </span> with Ajuwaya Market</h1>
			<p>Buy from Corpers. Sell to Corpers. By Corpers. From all over Nigeria.</p>
			<a href="post-ad.html">Post Free Ad</a>
	  </div>
	</div>
	<!-- Submit Ad -->
	<div class="submit-ad main-grid-border">
		<div class="container">
			<h2 class="head">Post an Ad</h2>
			<div class="post-ad-form">
				<form name="" method="POST" action='post-ad.php' >
					<label>Select Category <span>*</span></label>
					<select class="" name="category">
					  <option>Select Category</option>
					  <option>Mobiles</option>
					  <option>Electronics and Appliances</option>
					  <option>Cars</option>
					  <option>Bikes</option>
					  <option>Furniture</option>
					  <option>Pets</option>
					  <option>Books, Sports and hobbies</option>
					  <option>Fashion</option>
					  <option>Kids</option>
					  <option>Services</option>
					  <option>Real Estate</option>
					</select>
					<div class="clearfix"></div>
					<label>Ad Name <span>*</span></label>
					<input type="text" name="name" placeholder="">
					<div class="clearfix"></div>
					<label>Ad Price <span>*</span></label>
					<input type="text" name="price" placeholder="">
					<div class="clearfix"></div>
					<label>Ad Description <span>*</span></label>
					<textarea name="description" placeholder="Write few lines about your product"></textarea>
					<div class="clearfix"></div>
				
				<div class="upload-ad-photos">
				<label>Photos for your ad :</label>	
					<div class="photos-upload-view">
						

						<input type="hidden" id="MAX_FILE_SIZE" name="MAX_FILE_SIZE" value="300000" />

						<div>
							<input type="file" id="fileselect" name="pictureselect" multiple="multiple" />
							<!--<div id="filedrag">or drop files here</div>-->
						</div>

						

						

					<!--	
						
						<div id="submitbutton">
							<button type="submit">Upload Files</button>
						</div><div id="messages">


						<p>Status Messages</p>
						</div>-->
						</div>
						<input type="submit" value="Post">	
					<div class="clearfix"></div>
						<!--<script src="js/filedrag.js"></script>-->
						
				</div>
			</form>
			<form name="personal-details">
					<div class="personal-details">
					
							<label>Your Name <span>*</span></label>
							<input type="text" name="name" class="name" placeholder="">
							<div class="clearfix"></div>
							<label>Your Mobile No <span>*</span></label>
							<input type="text" name="phone" class="phone" placeholder="">
							<div class="clearfix"></div>
							<label>Your Locations<span>*</span></label>
							<input type="text" name="location"class="location" placeholder="">
							<div class="clearfix"></div>
							<p class="post-terms">By <strong>using our platform</strong> you accept our <a href="terms.html" target="_blank">Terms of Use </a> and <a href="privacy.html" target="_blank">Privacy Policy</a></p>
						<input type="submit" value="Save">					
						<div class="clearfix"></div>
			</form>
					</div>
			</div>
		</div>	
	</div>
	<!-- // Submit Ad -->
	<!--footer section start-->		
		<footer>
			<div class="footer-top">
				<div class="container">
					<div class="foo-grids">
						<div class="col-md-3 footer-grid">
							<h4 class="footer-head">Who We Are</h4>
							<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</p>
							<p>The point of using Lorem Ipsum is that it has a more-or-less normal letters, as opposed to using 'Content here.</p>
						</div>
						<div class="col-md-3 footer-grid">
							<h4 class="footer-head">Help</h4>
							<ul>
								<li><a href="howitworks.html">How it Works</a></li>						
								<li><a href="sitemap.html">Sitemap</a></li>
								<li><a href="faq.html">Faq</a></li>
								<li><a href="feedback.html">Feedback</a></li>
								<li><a href="contact.html">Contact</a></li>
								<li><a href="typography.html">Shortcodes</a></li>
							</ul>
						</div>
						<div class="col-md-3 footer-grid">
							<h4 class="footer-head">Information</h4>
							<ul>
								<li><a href="regions.html">Locations Map</a></li>	
								<li><a href="terms.html">Terms of Use</a></li>
								<li><a href="popular-search.html">Popular searches</a></li>	
								<li><a href="privacy.html">Privacy Policy</a></li>	
							</ul>
						</div>
						<div class="col-md-3 footer-grid">
							<h4 class="footer-head">Contact Us</h4>
							<span class="hq">Our headquarters</span>
							<address>
								<ul class="location">
									<li><span class="glyphicon glyphicon-map-marker"></span></li>
									<li>CENTER FOR FINANCIAL ASSISTANCE TO DEPOSED NIGERIAN ROYALTY</li>
									<div class="clearfix"></div>
								</ul>	
								<ul class="location">
									<li><span class="glyphicon glyphicon-earphone"></span></li>
									<li>+0 561 111 235</li>
									<div class="clearfix"></div>
								</ul>	
								<ul class="location">
									<li><span class="glyphicon glyphicon-envelope"></span></li>
									<li><a href="mailto:info@example.com">mail@example.com</a></li>
									<div class="clearfix"></div>
								</ul>						
							</address>
						</div>
						<div class="clearfix"></div>
					</div>						
				</div>	
			</div>	
			<div class="footer-bottom text-center">
			<div class="container">
				<div class="footer-logo">
					<a href="index.html"><span>Ajuwaya</span>Market</a>
				</div>
				<div class="footer-social-icons">
					<ul>
						<li><a class="facebook" href="#"><span>Facebook</span></a></li>
						<li><a class="twitter" href="#"><span>Twitter</span></a></li>
						<li><a class="instagram" href="#"><span>Instagram</span></a></li>
					</ul>
				</div>
				<div class="copyrights">
					<p>&copy 2018</p>
				</div>
				<div class="clearfix"></div>
			</div>
		</div>
		</footer>
		<!--footer section end-->
		
		<script>
				var form1 = document.forms.namedItem("uploads");
				form1.addEventListener('submit', function(ev) {

					//var oOutput = document.querySelector("div")
					oData1 = new FormData(form1);

					//oData.append("CustomField", "This is some extra data");

					var oReq1 = new XMLHttpRequest();
					oReq1.open("POST", "phps/upload.php", true);
					oReq1.onload = function(oEvent) {
					if (oReq1.status == 200) {
						//oOutput.innerHTML = "Uploaded!";
						alert("Done!");
					} else {
						//oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
						alert("Error " + oReq1.status + " occurred. \n\nPlease Try It Again");
					}
					};

					oReq1.send(oData1);
					ev.preventDefault();
				}, false);



				var form2 = document.forms.namedItem("personal-details");
				form2.addEventListener('submit', function(ev) {

					//var oOutput = document.querySelector("div")
					oData2 = new FormData(form2);

					//oData.append("CustomField", "This is some extra data");

					var oReq2 = new XMLHttpRequest();
					oReq2.open("POST", "phps/personal-details.php", true);
					oReq2.onload = function(oEvent) {
					if (oReq2.status == 200) {
						//oOutput.innerHTML = "Uploaded!";
						alert("Done!");
					} else {
						//oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
						alert("Error " + oReq1.status + " occurred. \n\nPlease Try It Again");
					}
					};

					oReq2.send(oData2);
					ev.preventDefault();
				}, false);
		</script>
</body>
</html>
<?php
$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

// A list of permitted file extensions
$allowed = array('png', 'jpg', 'gif','zip');

if(!empty($_FILES['pictureselect']) ){
	
	foreach ($_FILES['pictureselect']['error'] as $key => $error) {
		# code...
		mysqli_query($con,"INSERT INTO ads(name, email) VALUES ('$name', 'did1')");
		if ($error == UPLOAD_ERR_OK) {
			# code...
			$extension = pathinfo($_FILES['pictureselect']['name'][$key], PATHINFO_EXTENSION);
	
			if(!in_array(strtolower($extension), $allowed)){
				#echo '{"status":"error"}';
				http_response_code(406); //"not acceptable" error
				continue;
			}
	
			$tmp_name = $_FILES['pictureselect']['error'][$key];
			$name = basename($_FILES['pictureselect']['name'][$key]);
			$moved_ = move_uploaded_file($tmp_name, 'C:\\xampp\\htdocs\\ajuwaya\\uploads\\'.$name);
			if ($moved_) {
				# code...
				$q = mysqli_query($con,"INSERT INTO ads(name, email) VALUES ('$name', 'john@e--xamp.com')");
				if ($q) {
					# code...
					http_response_code(200); //'yea yea, ok'
					
				} else {
					# code...
					http_response_code(304); //"not modified" error
					
				}
			}
		}
	}

}

#echo '{"status":"error"}';
http_response_code(304); //"not modified" error
exit;

?>