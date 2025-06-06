
const defaultStyleCSS = `
.common li, .common span, .common a, .common input, .common img, .common h4,
.popup, .engine-editor{
    direction: ltr;
	margin: 0;
	padding: 0;
	border: 0;
	outline: 0;
	font-size: 10pt;
	font-weight: normal;
	text-decoration: none;
	font-family: sans-serif;
	vertical-align: baseline;
	background: transparent;
	color: #202020;
	text-align: left;
	line-height: normal;
	white-space: normal;
	-webkit-box-shadow: none;
	-webkit-border-radius:0;
	text-shadow: none;
	float: none;
	overflow: visible;
}
.common li, .common p, .common div, .common ul, .common h4{
	display: block;
}
.common h4{
	font-weight: bold;
}
.common ul{
	list-style-type: none;
}
.common span, .common img{
	display: inline;
}
.common input{
	display: inline-block;
	white-space: pre;
}
.common a:after, .common a[href^="http"]:after {
  content: '';
}
.engine-editor{

    z-index: 2147483647;
	padding: 0.5em;
	width: 35em;
	font-size: 9pt;
	background: #EDEDED;
	border: 3px solid #878787;
	-webkit-border-radius: 5px;
	-webkit-box-shadow: 0px 0px 8px #B0B0B0;
}
.engine-editor input[type='text']{
	width: 100%;
	margin-bottom: 0.5em;
	padding: 0.1em 0;
	display: block;
	border: 1px solid #A0A0A0;
	background: #fff;
	-webkit-border-radius: 2px;
}
.engine-editor input[type='button']{
	width: auto;
	display: inline-block;
	margin-top: 0.5em;
	margin-right: 0.5em;
	padding: 0.2em 0.4em;
	text-align: center;
	background: -webkit-gradient(linear, left top, left bottom, from(#F5F5F5), to(#E0E0E0));
	border: 1px solid #A0A0A0;
	-webkit-border-radius: 2px;
}
.engine-editor input[type='button']:hover{
	border: 1px solid #7C7C7C;
}
.engine-editor input[type='button']:active{
	background: -webkit-gradient(linear, left top, left bottom, from(#E0E0E0), to(#F5F5F5));
}
.engine-editor input[type='button']:disabled{
	color: #AAAAAA;
	background: -webkit-gradient(linear, left top, left bottom, from(#E7E7E7), to(#D3D3D3));
}
.engine-editor h4{
	margin: 0;
	height: 1.5em;
	font-size: 1.1em;
	padding-bottom: 0.3em;
	margin-bottom: 0.5em;
	border-bottom: 1px solid #CECECE;
}
.engine-editor input.close{
	float: right;
	margin: 0;
	height: 1.4em;
	width: 1.4em;
	padding-bottom: 0.3em;
	vertical-align: middle;
}
.engine-editor span.title{
	float: left;
	font-weight: bold;
	line-height: 1.5em;
}


.popup{
 width: 12em;
 position: absolute;
 background: #EDECEC;
 border: solid 1px #AEAAA7;
 padding: 0.3em 0.3em;
 font-size: 9pt;
 margin: 0;
 list-style-type: none;
 -webkit-box-shadow: 0px 1px 10px #ccc;
 display: block;
 font-family: sans-serif;
z-index: 2147483647;
}
.popup li{
 margin: 1px 0;
 padding: 0;
 text-align: left;
 color: #202020;
 display: block;
 font-family: sans-serif;
}
.popup input{
	width: 10.1em;
}
.popup img{
 width: 16px;
 height: 16px;
 vertical-align: middle;
 border:none;
 margin: 0;
 margin-right: 4px;
 display: inline;
}
.popup.mainmenu > li:first-child {
 overflow: hidden;
 text-overflow:ellipsis;
 white-space:nowrap;
 border-bottom: solid 1px #AEAAA7;
 margin-bottom: 0.5em;
 padding: 0.2em 0.3em;
}
.popup a{
 margin: 1px;
 text-decoration: none;
 color: #202020;
 display: block;
 padding: 0.2em 0.3em;
 -webkit-border-radius: 3px;
 font-family: sans-serif;
}
.popup a:hover, .popup a.active{
 background: #96B8E1;
}
.popup .engine-name{
 display: inline-block;
 width: 8.5em;
 overflow: hidden;
 text-overflow:ellipsis;
 white-space:nowrap;
 vertical-align: middle;
}
.button {
 position:absolute;
 background: #fafafa;
 background-repeat: no-repeat;
 background-position: center center;
 -webkit-border-radius: 3px;
 border: 1px solid #aaaaaa;
 width: 16px;
 height: 16px;
 font-family: sans-serif;
 z-index: 2147483647;
}
.popup .engine-separator{
 height: 1px;
 margin: 3px 0;
 background: #AEAAA7;
}
.popup.hidden{
	display: none;
}
`
