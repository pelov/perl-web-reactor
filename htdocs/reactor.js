/****************************************************************************
##
##  Web::Reactor application machinery
##  2013 (c) Vladi Belperchinov-Shabanski "Cade"
##  <cade@bis.bg> <cade@biscom.net> <cade@cpan.org>
##
##  LICENSE: GPLv2
##
****************************************************************************/

var user_agent = navigator.userAgent.toLowerCase();
var is_msie    = ( ( user_agent.indexOf( "msie"  ) != -1 ) && ( user_agent.indexOf("opera") == -1 ) );
var is_opera   =   ( user_agent.indexOf( "opera" ) != -1 );

/*** SHOW/HIDE elements ****************************************************/

function html_element_show( elem )
{
  elem.style.position   = "relative";
  elem.style.visibility = "visible";
}

function html_element_hide( elem )
{
  elem.style.position   = "absolute";
  elem.style.visibility = "hidden";
}

function html_element_toggle( elem )
{
  if( elem.style.visibility = "visible" )
    {
    html_element_show( elem );
    }
  else
    {
    html_element_hide( elem );
    }
}

function html_element_show_id( elem_id )
{
  var elem = document.getElementById( elem_id );
  html_element_show( elem );
}

function html_element_hide_id( elem_id )
{
  var elem = document.getElementById( elem_id );
  html_element_hide( elem );
}

function html_element_toggle_id( elem_id )
{
  var elem = document.getElementById( elem_id );
  html_element_toggle( elem );
}

/*-------------------------------------------------------------------------*/

function html_block_show( block )
{
  var ds = "block"; // display style
  
  if( block.tagName == "TR" && ! is_msie )
    ds = "table-row";

  block.style.display = ds;
}

function html_block_hide( block )
{
  block.style.display = "none";
}

function html_block_toggle( block )
{
  if( block.style.display == "none" )
    {
    html_block_show( block );
    }
  else
    {
    html_block_hide( block );
    }
}

function html_block_show_id( block_id )
{
  var block = document.getElementById( block_id );
  html_block_show( block );
}

function html_block_hide_id( block_id )
{
  var block = document.getElementById( block_id );
  html_block_hide( block );
}

function html_block_toggle_id( block_id )
{
  var block = document.getElementById( block_id );
  html_block_toggle( block );
}

/***************************************************************************/

/* FOR DELETE 
function toggle_display( eid )
{
  var elem = document.getElementById( eid );
  if( elem.style.position == "absolute" )
    {
    elem.style.position   = "relative";
    elem.style.visibility = "visible";
    }
  else
    {
    elem.style.position   = "absolute";
    elem.style.visibility = "hidden";
    }
}

function toggle_display_block( eid )
{
  var elem = document.getElementById( eid );
  if( elem.style.display == "none" )
    {
    elem.style.display = "block";
    }
  else
    {
    elem.style.display = "none";
    }
}

function toggle_display_tr( eid )
{
  var elem = document.getElementById( eid );
  if( elem.style.display == "none" )
    {
    if( is_msie )
      elem.style.display = "block";
    else
      elem.style.display = "table-row";
    }
  else
    {
    elem.style.display = "none";
    }
}

function hide_display_tr( eid )
{
  var elem = document.getElementById( eid );
  if( elem.style.display == "none" )
    {
    if( is_msie )
      elem.style.display = "block";
    else
      elem.style.display = "table-row";
    }
  else
    {
    elem.style.display = "none";
    }
}
FOR DELETE */

/***************************************************************************/

function ftree_click( ftree_id, branch_id )
{
  var root_table = document.getElementById( ftree_id );
  var branch_tr  = document.getElementById( branch_id );

  branch_tr.open = ! branch_tr.open;

  //alert(branch_tr.open + branch_tr.id );
  
  var elems = root_table.getElementsByTagName( 'TR' )
  var bia = branch_id.split(".");

  for( var i = 0; i < elems.length; i++ )
    {
    var el = elems[i];
    var el_id = elems[i].id;

    var eia = el_id.split(".");

    if( el_id.substr( 0, branch_id.length ) == branch_id )
      {
      if( branch_tr.open )
        {
        if( eia.length == bia.length + 1 )
          {
          html_block_show( el );
          }
        }
      else
        {
        if( eia.length > bia.length )
          {
          html_block_hide( el );
          el.open = false;
          }
        }    
      }  
    }

}

/***************************************************************************/

function current_date()
  {
  var now = new Date();
  var d = now.getDate();
  var m = now.getMonth() + 1;
  var y = now.getYear();
  if( ! is_msie ) y += 1900;
  if( d < 10 ) d = '0' + d;
  if( m < 10 ) m = '0' + m;
  return d + '.' + m + '.' + y;
  }

function current_time()
  {
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  var s = now.getSeconds();
  if( h < 10 ) h = '0' + h;
  if( m < 10 ) m = '0' + m;
  if( s < 10 ) s = '0' + s;
  return  h + ':' + m + ':' + s;
  }

function current_utime()
  {
  var now = new Date();
  return current_date() + ' ' + current_time();
  }

/* used for input html elements with onClick=js:etc... */
function set_value( id_name, val )
  {
  var e = document.getElementById( id_name );
  e.value = val;
  return false;
  }

/***EOF*********************************************************************/
