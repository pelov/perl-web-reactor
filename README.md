# NAME

Web::Reactor perl-based web application machinery.

# SYNOPSIS

Startup CGI script example:

    #!/usr/bin/perl
    use strict;
    use lib '/opt/perl/reactor/lib'; # if Reactor is custom location installed
    use Web::Reactor;

    my %cfg = (
              'APP_NAME'     => 'demo',
              'APP_ROOT'     => '/opt/reactor/demo/',
              'LIB_DIRS'     => [ '/opt/reactor/demo/lib/'  ],
              'ACTIONS_SETS' => [ 'demo', 'Base', 'Core' ],
              'HTML_DIRS'    => [ '/opt/reactor/demo/html/' ],
              'SESS_VAR_DIR' => '/opt/reactor/demo/var/sess/',
              'DEBUG'        => 4,
              );

    eval { new Web::Reactor( %cfg )->run(); };
    if( $@ )
      {
      print STDERR "REACTOR CGI EXCEPTION: $@";
      print "content-type: text/html\n\nsystem is temporary unavailable";
      }

HTML page file example:

    <#html_header>

    <$app_name>

    <#menu>

    testing page html file

    action test: <&test>

    <#html_footer>

Action module example:

    package Reactor::Actions::demo::test;
    use strict;
    use Data::Dumper;
    use Web::Reactor::HTML::FormEngine;

    sub main
    {
      my $reo = shift; # Web::Reactor object. Provides all API and context.

    my $text; # result html text

    if( $reo->get_input_button() eq 'FORM_CANCEL' )
      {
      # if clicked form button is cancel,
      # return back to the calling/previous page/view with optional data
      return $reo->forward_back( ACTION_RETURN => 'IS_CANCEL' );
      }

    # add some html content
    $text .= "<p>Reactor::Actions::demo::test here!<p>";

    # create link and hide its data. only accessible from inside web app.
    my $grid_href = $reo->args_new( _PN => 'grid', TABLE => 'testtable', );
    $text .= "<a href=?_=$grid_href>go to grid</a><p>";

    # access page session. it will be auto-loaded on demand
    my $page_session_hr = $reo->get_page_session();
    my $fortune = $page_session_hr->{ 'FORTUNE' } ||= `/usr/games/fortune`;
    

    # access input (form) data. $i and $e are hashrefs
    my $i = $reo->get_user_input(); # get plain user input (hashref)
    my $e = $reo->get_safe_input(); # get safe data (never reach user browser)

    $text .= "<p><hr><p>$fortune<hr>";

    my $bc = $reo->args_here(); # session keeper, this is manual use

    $text .= "<form method=post>";
    $text .= "<input type=hidden name=_ value=$bc>";
    $text .= "input <input name=inp>";
    $text .= "<input type=submit name=button:form_ok>";
    $text .= "<input type=submit name=button:form_cancel>";
    $text .= "</form>";

    my $form = $reo->new_form();

    $text .= "<p><hr><p>";

      return $text;
    }

    1;

# DESCRIPTION

Web::Reactor (WR) provides automation of most of the usual and frequent tasks
when constructing a web application. Such tasks include:

    * User session handling (creation, cookies support, storage)
    * Page (web screen/view) session handling (similar to user sessions attributes)
    * Sessions (user/page/etc.) data storage and auto load/ssave
    * Inter-page relations and data transport (hides real data from the end-user)
    * HTML page creation and expansion (i.e. including preprocessing :))
    * Optional HTML forms creation and data handling

Web::Reactor is designed to allow extending or replacing some parts as:

    * Session storage (data store on filesystem, database, remote or vmem)
    * HTML creation/expansion/preprocessing
    * Page actions/modules execution (can be skipped if custom HTML prep used)

# PAGE NAMES, HTML FILE TEMPLATES, PAGE INSTANCES

WR has a notion of a "page" which represents visible output to the end user 
browser. It has (i.e. uses) the following attributes:

    * html file template (page name)
    * page session data
    * actions code (i.e. callbacks) used inside html text

All of those represent "page instance" and produce end user html visible page.

"Page names" are limited to be alphanumeric and are mapped to file 
(or other storage) html content:

                     page name: example
    html file template will be: page_example.html
    

HTML content may include other files (also limited to be alphanumeric):

     include text: <#other_file>
    file included: other_file.html
    

Page names may be requested from the end user side, but include html files may
be used only from the pages already requested.

# ACTIONS/MODULES/CALLBACKS

Actions are loaded and executed by package names. In the HTML source files they
can be called this way:

    <&test_action arg1=val1 arg2=val2 flag1 flag2...>
    <&test_action>
    

This will instruct Reactor action handler to look for this package name inside
standard or user-added library directories:

    Web/Reactor/Actions/*/test_action.pm

Asterisk will be replaced with the name of the used "action sets" give in config
hash:

       'ACTIONS_SETS' => [ 'demo', 'Base', 'Core' ],

So the result list in this example will be:

    Web/Reactor/Actions/demo/test_action.pm
    Web/Reactor/Actions/Base/test_action.pm
    Web/Reactor/Actions/Core/test_action.pm

This is used to allow overriding of standard modules or modules you dont have
write access to.

Another way to call a module is directly from another module code with:

    $reo->act_call( 'test_action', @args );
    

The package file will look like this:

    package Web/Reactor/Actions/demo/test_action;
    use strict;
    

    sub main
    {
      my $reo  = shift; # Web::Reactor object/instance
      my %args = @_; # all args passed to the action
      

      my $html_args = $args{ 'HTML_ARGS' }; # all
      ...
      return $result_data; # usually html text
    }
    

$html\_args is hashref with all args give inside the html code if this action 
is called from a html text. If you look the example above:

    <&test_action arg1=val1 arg2=val2 flag1 flag2...>
    

The $html\_args will look like this:

    $html_args = {
                 'arg1'  => 'val1',
                 'arg2'  => 'val2',
                 'flag1' => 1,
                 'flag2' => 1,
                 };





# HTTP PARAMETERS NAMES

Web::Reactor uses underscore and one or two letters for its system http/html 
parameters. Some of the system params are:

    _PN  -- html page name (points to file template, restricted to alphanumeric)
    _AN  -- action name (points to action package name, restricted to alphanumeric)
    _P   -- page session
    _R   -- referer (caller) page session

Usually those names SHOULD NOT be directly used or visible inside actions code.
More details about how those params are used can be found below.

# USER SESSIONS

WR creates unique session for each connected user. The session is kept by a cookie.
Usually WR needs justthis cookie to handle all user/server interaction. Inside
WR action code, user session is represented as a hash reference. It may hold
arbitrary data. "System" or WR-specific data inside user session has colon as
prefix:

    # $reo is Web::Reactor object (i.e. context) passed to the action/module code
    my $user_session = $reo->get_user_session();
    print STDERR $user_session->{ ':CTIME_STR' };
    # prints in http log the create time in human friendly form

All data saved inside user session is automatically saved. When needed it can
be explicitly with:

    $reo->save();
    # saves all modified context to disk or other storage

# PAGE SESSIONS

Each page presented to the user has own session. It is very similar to the user
session (it is hash reference, may hold any data, can be saved with $reo->save()).
It is expected that page sessions hold all context data needed for any page to
display properly. To preserve page session it is needed that it is included
in any link to this page instance or in any html form used.

When called for the first time, each page request needs page name (\_PN). Afterwards
a unique page session is created and page name is saved inside. At this moment
this page instance can be accessed (i.e. given control to) only with a page
session id (\_P):

    $page_sid = ...; # taken from somewhere
    # to pass control to the page instance:
    $reo->forward( _P => $page_sid );
    # the page instance will pull data from its page session and display in
    # its last known state

Not always page session are needed. For example, when forward to the caller is
needed, you just need to:

    $reo->forward_back();
    # this is equivalent to
    my $ref_page_sid = $reo->get_ref_page_session_id();
    $reo->forward( _P => $ref_page_sid );

Each page instance knows the caller page session and can give control back to.
However it may pass more data when returning back to the caller:

    $reo->forward_back( MORE_DATA => 'is here', OPTIONS_LIST => \@list );
    

When new page instance has to be called (created):



    $reo->forward_new( _PN => 'some_page_name' );

# CONFIG ENTRIES

Upon creation, Web:Reactor instance gets hash with config entries/keys:

    * APP_NAME      -- alphanumeric application name (plus underscore)
    * APP_ROOT      -- application root dir, used for app components search
    * LIB_DIRS      -- directories from which actions and other libs are loaded
    * ACTIONS_SETS  -- list of action "sets", appended to ACTIONS_DIRS
    * HTML_DIRS     -- html file inlude directories
    * SESS_VAR_DIR  -- used by filesystem session handling to store sess data
    * DEBUG         -- positive number, enables debugging with verbosity level

Some entries may be omitted and default values are:

    * LIB_DIRS      -- [ "$APP_ROOT/lib"  ]
    * ACTIONS_SETS  -- [ $APP_NAME, 'Base', 'Core' ]
    * HTML_DIRS     -- [ "$APP_ROOT/html" ]
    * SESS_VAR_DIR  -- [ "$APP_ROOT/var"  ]
    * DEBUG         -- 0
     

# API FUNCTIONS

    # TODO: input
    # TODO: sessions
    # TODO: arguments, constructing links
    # TODO: forwarding
    # TODO: html, forms, session keeping

# DEPLOYMENT, DIRECTORIES, FILESYSTEM STRUCTURE

    # TODO: install, cpan, manual, github, custom locations
    # TODO: sessions dir, custom storage/session handling

# PROJECT STATUS

At the moment Web::Reactor is in beta. API is mostly frozen but it is fairly
possible to be changed and/or extended. However drastic changes are not planned :)

If you are interested in the project or have some notes etc, contact me at:

    Vladi Belperchinov-Shabanski "Cade"
    <cade@bis.bg> 
    <cade@biscom.net> 
    <cade@cpan.org> 
    <cade@datamax.bg>

further contact info, mailing list and github repository is listed below.

# FIXME: TODO: 

    * config examples
    * pages example
    * actions example
    * API description (input data, safe data, sessions, forwarding, actions, html)
    * ...

# REQUIRED ADDITIONAL MODULES

Reactor uses mostly perl core modules but it needs few others:

    * CGI
    * Exception::Sink
    * Data::Tools

# DEMO APPLICATION

Documentation will be improved shortly, but meanwhile you can check 'demo'
directory inside distribution tarball or inside the github repository. This is
fully functional (however stupid :)) application. It shows how data is processed,
calling pages/views, inspecting page (calling views) stack, html forms automation,
forwarding.
  

# MAILING LIST

    web-reactor@googlegroups.com

# GITHUB REPOSITORY

    https://github.com/cade-vs/perl-web-reactor
    

    git clone git://github.com/cade-vs/perl-web-reactor.git

# AUTHOR

    Vladi Belperchinov-Shabanski "Cade"

    <cade@biscom.net> <cade@datamax.bg> <cade@cpan.org>

    http://cade.datamax.bg
