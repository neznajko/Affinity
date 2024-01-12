////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
(function(){
    const DOWN = 0;
    const UP = 1;
    //////////////////////////////////////////////////////////
    const CREATE = "c";
    const HUE =    "h";
    const SAT =    "s";
    const VAL =    "v";
    const ROTATE = "r";
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    class Canvas {
        constructor( name ){
            this.canvas = document.getElementById( name );
            this.ctx = this.canvas.getContext( "2d" );
            this.stk = [];
            this.fullScreen();
            // add Event Listeners
            this.onWheel();
            this.onKeyDown();
            this.onKeyUp();
            this.onMouseDown();
            this.onMouseUp();
            this.onMouseMove();
            // flags
            this.flagMouseDown = false;
            this.toggle = {};
        }
        getTopBox() {
            return this.stk[ this.stk.length - 1 ];
        }
        _wheel( e ) {
            const box = this.getTopBox();
            if( this.toggle[ HUE ]){
                box.handleEvent( "hue", e );     
            } else if( this.toggle[ SAT ]){
                box.handleEvent( "sat", e );
            } else if( this.toggle[ VAL ]){
                box.handleEvent( "val", e );
            } else if( this.toggle[ ROTATE ]){
                box.handleEvent( "rotation", e );
            } else {
                box.handleEvent( "scaling", e );
            }
        }
        onWheel() {
            this.canvas.addEventListener( "wheel", e => {
                // negative deltaY is wheel up
                this._wheel( +( e.deltaY < 0 ));
            });
        }
        onKeyDown() {
            document.addEventListener( "keydown", e => {
                const key = e.key;
                // set to false if undefined
                if(! key in this.toggle ){
                    this.toggle[ key ] = false;
                }
                if( key == "PageUp" || key == "PageDown" ){
                    this._wheel( +( key == "PageUp" ));
                } 
            });
        }
        onKeyUp() {
            document.addEventListener( "keyup", e => {
                this.toggle[ e.key ] = !this.toggle[ e.key ];
                if( e.key == CREATE && !this.toggle[ e.key ]){
                    // figure out negative dimensions
                    this.getTopBox().bePositive();
                }
            });
        }
        onMouseDown() {
            this.canvas.addEventListener( "mousedown", e => {
                // activate the lasers
                this.flagMouseDown = true;
                //
                if( this.toggle[ CREATE ]){
                    this.stk.push( new Box( e.x, e.y, this ));
                } else {
                    let j = this.stk.length - 1;
                    for(; j >= 0; --j ){
                        const box = this.stk[j];
                        if( box.handleEvent( "mousedown", e )){
                            break;
                        }
                    }
                    // j negative means mouse not within any box
                    if( j >= 0 ){
                        // put jth box at the top
                        const box = this.stk.splice( j, 1 )[ 0 ]; 
                        this.stk.push( box );
                        // re-render
                        this.render();
                    }
                }
            });
        }
        //////////////////////////////////////////////////////
        onMouseUp() {
            this.canvas.addEventListener( "mouseup", e => {
                // lasers deactivation confirmed 
                this.flagMouseDown = false;
            });
        }
        //////////////////////////////////////////////////////
        onMouseMove() {
            this.canvas.addEventListener( "mousemove", e => {
                if( this.flagMouseDown ){
                    if( this.toggle[ CREATE ]){
                        this.getTopBox()
                            .handleEvent( "construction", e );
                    } else {
                        this.getTopBox()
                            .handleEvent( "traveling", e );
                    }
                } else {
                    this.stk.forEach( box => {
                       box.handleEvent( "mousemove", e );
                    });
                }
            });
        }
        //////////////////////////////////////////////////////
        fullScreen() {
            this.backup();
            this.changeBoundingBox
            ( 0, 0, window.innerWidth, window.innerHeight ); 
        }
        changeBoundingBox( x, y, width, height ){
            this.canvas.style.left = x + "px";
            this.canvas.style.top = y + "px";
            this.canvas.width = width;
            this.canvas.height = height;
        }
        resetBoundingBox() {
            const r = this.cache.rect;
            this.changeBoundingBox
                 ( r.x, r.y, r.width, r.height );
        }
        backup() {
            this.cache = {
                rect: this.canvas.getBoundingClientRect(),
            };
        }
        push( box ){
            this.stk.push( box );
        }
        getWidth() {
            return this.canvas.width;
        }
        getHeight() {
            return this.canvas.height;
        }
        clear() {
            this.ctx.clearRect
            ( 0, 0, this.getWidth(), this.getHeight());
        }
        render() {
            this.clear();
            for( const box of this.stk ){
                this.ctx.drawImage( box.render(), 0, 0 );
            }
        }
    }
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    function mod( n, d ){
        return (( n % d ) + d ) % d;
    }
    //////////////////////////////////////////////////////////
    class Color {
        constructor( hue, sat, val ){
            this.hue = hue;
            this.sat = sat;
            this.val = val;
        }
        get hsl() {
            return( "hsl(" + this._hue + "," +
                           + this._sat + "%," +
                           + this._val + "%)" );
        }
        get hue() {
            return this._hue;
        }
        get sat() {
            return this._sat;
        }
        get val() {
            return this._val;
        }
        set hue( hue ){
            this._hue = mod( hue, 360 );
        }
        set sat( sat ){
            this._sat = mod( sat, 101 );
        }
        set val( val ){
            this._val = mod( val, 101 );
        }
    }
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    const SCALEUP = 1.4;
    const SCALEDOWN = 1 / SCALEUP;
    //////////////////////////////////////////////////////////
    const STEPHUE = 10;
    const INCHUE = [ -STEPHUE, STEPHUE ];
    //////////////////////////////////////////////////////////
    const STEPSAT = 5;
    const INCSAT = [ -STEPSAT, STEPSAT ];
    //////////////////////////////////////////////////////////
    const STEPVAL = 5;
    const INCVAL = [ -STEPVAL, STEPVAL ];
    //////////////////////////////////////////////////////////
    const STEPROTATE = 5 * Math.PI / 180;
    const INCROTATE = [ -STEPROTATE, STEPROTATE ];
    //////////////////////////////////////////////////////////
    class Box {
        constructor( x, y, canvas ){
            this.x = x;
            this.y = y;
            this.angle = 0;
            this.canvas = canvas;
            this.sketch = document.createElement( "canvas" );
            this.sketch.width = canvas.getWidth();
            this.sketch.height = canvas.getHeight();
            this.ctx = this.sketch.getContext( "2d" );
            this.handler = {
                "mousedown":    this.handleMouseDown,
                "mousemove":    this.handleMouseMove,
                "traveling":    this.handleTraveling,
                "scaling":      this.handleScaling,
                "rotation":     this.handleRotation,
                "construction": this.handleConstruction,
                "hue":          this.handleHue,
                "sat":          this.handleSat,
                "val":          this.handleVal,
            };
            this.mouseX = 0;
            this.mouseY = 0;
            // optional attributes
            this.Width( 100 );
            this.Height( 50 );
            this.Color( 0, 100, 60 );
        }
        Width( width ){
            this.width = width;
            return this;
        }
        Height( height ){
            this.height = height;
            return this;
        }
        Color( hue, sat, val ){
            this.color = new Color( hue, sat, val );
            this.ctx.fillStyle = this.color.hsl;
            return this;
        }
        Hue( hue ){
            this.color.hue = hue; 
            this.ctx.fillStyle = this.color.hsl;
            return this;
        }
        Sat( sat ){
            this.color.sat = sat;
            this.ctx.fillStyle = this.color.hsl;
            return this;
        }
        Val( val ){
            this.color.val = val;
            this.ctx.fillStyle = this.color.hsl;
            return this;
        }
        clear() {
            this.ctx.clearRect
            ( 0, 0, this.sketch.width, this.sketch.height );
        }
        render() {
            this.ctx.translate( this.x, this.y );
            this.ctx.rotate( this.angle );
            this.ctx.fillRect( 0, 0, this.width, this.height );
            this.ctx.resetTransform();
            return this.sketch;
        }
        handleEvent( type, e ){
            if( type in this.handler ){
                return this.handler[ type ]( e );
            }
        }
        mouseInsideBoxCheck( e ){
            const x = e.x - this.x;
            const y = e.y - this.y;
            const a = this.angle;
            const c = Math.cos( a );
            const s = Math.sin( a );
            const u =  c * x + s * y;
            const v = -s * x + c * y;
            return( u >= 0 && u <= this.width &&
                    v >= 0 && v <= this.height );
        }
        // here use arrow methods so this will point to this
        // object not this function after evaluating from
        // this.handler[ type ]
        handleMouseDown = e => {
            this.mouseX = e.x;
            this.mouseY = e.y;
            return this.mouseInsideBoxCheck( e );
        }
        handleMouseMove = e => {}
        travel( dx, dy ){
            this.x += dx;
            this.y += dy;
        }
        scale( factor ){
            this.width *= factor;
            this.height *= factor;
        }
        rotate( angle ){
            this.angle += angle;
        }
        handleRotation = e => {
            this.clear();
            this.rotate( INCROTATE[ e ]);
            this.canvas.render();
        }
        handleTraveling = e => {
            this.clear();
            const dx = e.x - this.mouseX;
            const dy = e.y - this.mouseY;
            this.travel( dx, dy );
            this.mouseX = e.x;
            this.mouseY = e.y;
            this.canvas.render();
        }
        handleScaling = e => {
            this.clear();
            const factor = e ? SCALEUP : SCALEDOWN;
            this.scale( factor );
            this.canvas.render();
        }
        handleHue = e => {
            this.clear();
            this.Hue( this.color.hue + INCHUE[ e ] );
            this.canvas.render();
        }
        handleSat = e => {
            this.clear();
            this.Sat( this.color.sat + INCSAT[ e ]);
            this.canvas.render();
        }
        handleVal = e => {
            this.clear();
            this.Val( this.color.val + INCVAL[ e ]);
            this.canvas.render();
        }
        handleConstruction = e => {
            this.clear();
            this.width = e.x - this.x;
            this.height = e.y - this.y;
            this.canvas.render();
        }
        bePositive() {
            if( this.width < 0 ){
                this.x += this.width;
                this.width = -this.width;
            }
            if( this.height < 0 ){
                this.y += this.height;
                this.height = -this.height;
            }
        }
    }
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    this.Affinity = {
        Canvas: Canvas,
        Box: Box,
    };
}());
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// log:
