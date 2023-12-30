////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
(function(){
    const DOWN = 0;
    const UP = 1;
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    class Canvas {
        constructor( name ){
            const canvas = document.getElementById( name );
            this.canvas = canvas;
            this.ctx = canvas.getContext( "2d" );
            this.stk = [];
            this.backup();
            this.fullScreen();
            // add Event Listeners
            this.onWheel();
            this.onKeyDown();
            this.onMouseDown();
            this.onMouseUp();
            this.onMouseMove();
            // flags
            this.flagMouseDown = false;
        }
        getTopBox() {
            const n = this.stk.length;
            return this.stk[ n - 1 ];
        }
        onWheel() {
            this.canvas.addEventListener( "wheel", e => {
                const box = this.getTopBox();
                // negative deltaY is wheel up
                box.handleEvent( "scaling", e.deltaY < 0 );
            });
        }
        onKeyDown() {
            this.canvas.focus(); // tabindex
            this.canvas.addEventListener( "keydown", e => {
                const box = this.getTopBox();
                if( e.key == "PageUp" ){
                    box.handleEvent( "scaling", UP );
                } else 
                if( e.key == "PageDown" ){
                    box.handleEvent( "scaling", DOWN );
                }
            });
        }
        onMouseDown() {
            this.canvas.addEventListener( "mousedown", e => {
                let j = this.stk.length - 1;
                for(; j >= 0; --j ){
                    const box = this.stk[j];
                    if( box.handleEvent( "mousedown", e )){
                        break;
                    }
                }
                if( j >= 0 ){
                    // put jth box at the top
                    const box = this.stk.splice( j, 1 )[ 0 ]; 
                    this.stk.push( box );
                    // re-render
                    this.render();
                    // activate the lasers
                    this.flagMouseDown = true;
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
                    const box = this.getTopBox();
                    box.handleEvent( "traveling", e );
                } else {
                    this.stk.forEach( box => {
                       box.handleEvent( "mousemove", e );
                    });
                }
            });
        }
        //////////////////////////////////////////////////////
        fullScreen() {
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
    //////////////////////////////////////////////////////////
    const SCALEUP = 1.4;
    const SCALEDOWN = 1 / SCALEUP;
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    class Box {
        constructor( x, y, canvas ){
            this.x = x;
            this.y = y;
            this.canvas = canvas;
            this.sketch = document.createElement( "canvas" );
            this.sketch.width = canvas.getWidth();
            this.sketch.height = canvas.getHeight();
            this.ctx = this.sketch.getContext( "2d" );
            this.handler = {
                "mousedown": this.handleMouseDown,
                "mousemove": this.handleMouseMove,
                "traveling": this.handleTraveling,
                "scaling":   this.handleScaling,
            };
            this.mouseX = 0;
            this.mouseY = 0;
            // optional attributes
            this.Width( 100 );
            this.Height( 50 );
            this.Bgr( "#22a");
        }
        Width( width ){
            this.width = width;
            return this;
        }
        Height( height ){
            this.height = height;
            return this;
        }
        Bgr( bgr ){
            this.bgr = bgr;
            this.ctx.fillStyle = bgr;
            return this;
        }
        clear() {
            this.ctx.clearRect
            ( 0, 0, this.sketch.width, this.sketch.height );
        }
        render() {
            this.ctx.fillRect
                 ( this.x, this.y, this.width, this.height );
            return this.sketch;
        }
        handleEvent( type, e ){
            if( type in this.handler ){
                return this.handler[ type ]( e );
            }
        }
        mouseInsideBoxCheck( e ){
            return( e.x >= this.x &&
                    e.x <= this.x + this.width &&
                    e.y >= this.y &&
                    e.y <= this.y + this.height );
        }
        // here use arrow methods so this will point to this
        // object not this function after evaluating from
        // this.handler[ type ]
        handleMouseDown = e => {
            this.mouseX = e.x;
            this.mouseY = e.y;
            return this.mouseInsideBoxCheck( e );
        }
        handleMouseMove = e => {
            if( this.mouseInsideBoxCheck( e )){
                console.log( e.x, e.y );
            }
        }
        travel( dx, dy ){
            this.x += dx;
            this.y += dy;
        }
        scale( factor, px=this.x, py=this.y ){
            this.width *= factor;
            this.height *= factor;
            const dx = ( 1 - factor )*( px - this.x );
            const dy = ( 1 - factor )*( py - this.y );
            this.travel( dx, dy );
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
            const factor = e == DOWN ? SCALEDOWN : SCALEUP;
            this.scale( factor );
            this.canvas.render();
        }
    }
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    class MsgBox extends Box {
        travel( dx, dy ){
            super.travel( dx, dy );
            console.log( "msg box" );
        }
    }
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    this.Avontage = {
        Canvas: Canvas,
        Box: Box,
        MsgBox: MsgBox,
    };
}());
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// log: + test with more boxes
//      + write helper func for getting active box( stk[-1] )
//      + move to msgbox
//      + after each box nadle event tha canvas is calling
//        this.render, better pass canvas and let boxes call
//        canvas.render
//      + change w and h to width and height
