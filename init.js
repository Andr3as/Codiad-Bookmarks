/*
* Copyright (c) Codiad & Andr3as, distributed
* as-is and without warranty under the MIT License.
* See http://opensource.org/licenses/MIT for more information.
* This information must remain intact.
*/

(function(global, $){
    
    var codiad = global.codiad,
        scripts = document.getElementsByTagName('script'),
        path = scripts[scripts.length-1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/')+'/';

    $(function() {
        codiad.Bookmark.init();
    });

    codiad.Bookmark = {
        
        path: curpath,
        
        init: function() {
            var _this = this;
            amplify.subscribe('active.onOpen', function(path){
                var manager = codiad.editor.getActive().commands;
                manager.addCommand({
                    name: 'SetBookmark',
                    bindKey: {win: 'Ctrl-B',  mac: 'Command-B'},
                    exec: function(e) {
                        _this.setBookmark();
                    }
                });
                manager.addCommand({
                    name: 'NextBookmark',
                    bindKey: {win: 'Alt-B',  mac: 'Alt-B'},
                    exec: function(e) {
                        _this.jumpDown();
                    }
                });
                manager.addCommand({
                    name: 'PrevBookmark',
                    bindKey: {win: 'Alt-Shift-B',  mac: 'Alt-Shift-B'},
                    exec: function(e) {
                        _this.jumpUp();
                    }
                });
            });
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Set or remove bookmark/s
        //
        //  Parameters:
        //
        //  line - {number} - (optional) - Line of new or existing bookmark
        //
        //////////////////////////////////////////////////////////
        setBookmark: function(line) {
            var editor  = codiad.editor.getActive();
            var multi   = false;
            if ( (typeof(line) == 'undefined') || (line < 0) || (line >= editor.getSession().getLength()) ) {
                line    = editor.getCursorPosition().row;
                multi   = editor.inMultiSelectMode;
            }
            
            if (multi) {
                //Multiselection
                var multiRanges = editor.multiSelect.getAllRanges();
                for (var i = 0; i < multiRanges.length; i++) {
                    this.new(multiRanges[i].cursor.row);
                }
            } else {
                //Singleselection
                this.new(line);
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Set or remove breakpoint
        //
        //  Parameters:
        //
        //  line - {number} - (optional) - Line of new or existing breakpoint
        //
        //////////////////////////////////////////////////////////
        new: function(line) {
            var session = codiad.editor.getActive().getSession();
            if (session.getBreakpoints().indexOf(line) !== -1) {
                //Breakpoint already exits, remove it
                session.clearBreakpoint(line);
            } else {
                session.setBreakpoint(line, line);
            }
            
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Jump to next breakpoint
        //
        //////////////////////////////////////////////////////////
        jumpDown: function() {
            var points = this.getPoints();
            if (points.length === 0) {
                return false;
            }
            var pos = codiad.editor.getActive().getCursorPosition();
            if (points.indexOf(pos.row) == -1) {
                points.push(pos.row);
            }
            var index = points.indexOf(pos.row);
            if (index == (points.length-1)) {
                this.jumpTo(points[0]);
            } else {
                this.jumpTo(points[index+1]);
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Jump to previous breakpoint
        //
        //////////////////////////////////////////////////////////
        jumpUp: function() {
            var points = this.getPoints();
            if (points.length === 0) {
                return false;
            }
            var pos = codiad.editor.getActive().getCursorPosition();
            if (points.indexOf(pos.row) == -1) {
                points.push(pos.row);
            }
            var index = points.indexOf(pos.row);
            if (index === 0) {
                this.jumpTo(points[points.length-1]);
            } else {
                this.jumpTo(points[index-1]);
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Jump to a certain line
        //
        //  Parameters
        //
        //  line - {number} - Line to jump to
        //
        //////////////////////////////////////////////////////////
        jumpTo: function(line) {
            codiad.editor.gotoLine(line+1);
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Get existing bookmark
        //
        //////////////////////////////////////////////////////////
        getPoints: function() {
            var session = codiad.editor.getActive().getSession();
            var points = session.getBreakpoints();
            var buf = [];
            $.each(points, function(i, item){
                if (typeof(item) != 'undefined') {
                    buf.push(item);
                }
            });
            return buf;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Sort bookmarks by line number
        //
        //  Parameters
        //
        //  points - {Array} - Bookmarks to sort
        //
        //////////////////////////////////////////////////////////
        sortPoints: function(points) {
            return points.sort(function(a,b){return a-b});
        }
    };
})(this, jQuery);