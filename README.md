# Affinity

Ok, so I didn't make a video to demonstrate the program, 
because I'm lazy, not to mention that it's in very preliminary
stage, and has bugs no doubt, but it's kind of working.

I did it mainly for myself as a tool for drawing the human body,
it's a *JavaScript* code using **canvas** as the only *dom* object
(not counting html, body etc. of course), the idea is the following:

We can approach a picture composition as a composition of canvases
or frames, in the program they are called boxes. So let's say we 
want to draw a tree a river a house and some clouds. Starting from 
the initial canvas we don't draw any form or perspective fyorst, but
for every element we put a corresponding canvas, thus building the
composition as a whole, consisting only of canvases, only then in 
each canvas or box we draw the form and the perspective. So basically 
this is it.

The human body is a picture composition itself consisting of head, 
neck, upper torso, lower torso, upper arms, lower arms, hands,
upper leg, lower leg, and feet, so we fyorst draw the human
body by drawing the corresponding composition of canvases.

In the program all commands are of the form:
[ key ] + *mouse action*, the key may be omitted, the default actions
being moving the box for mouse dragging, or scaling for mouse wheel.
You don't need to hold the key while performing the mouse action,
not to mention that some laptops are blocking the touchpad while
some key is being pressed. Mouse wheel can be replaced by Page Up/Down keys.
So this are the actions:

 * c + mouse dragging - create box
 * r + mouse wheel / Page Up/Down - rotate
 * h + mouse wheel - change box hue
 * s + mouse wheel - change box saturation
 * v + mouse wheel - change box value
 * x + mouse wheel - change box width
 * y + mouse wheel - change box height

To select a box, simply click on it, pressing a key will start a
new action if the key is not c,r,h,s,v,x or y the effect will be to
perform the default actions which are moving or scaling.

The name of the program comes from the affine hull in math, it
also sounds like infinity, when I've mention to GhatGPT about the
name it was very excited, "That's a great name ..." repeating
basically what I've said:)

## OK
Now there is Load and Save:

 * S - Save, saves to browser's default directory 
 * L - Load, opens up a dialog for loading the file

File name is by convention called haHa.json( convetion over configuration ),
for every new copy the browser automatically adds haHa(1).json, 
haHa(2).json, etc., so no need to keep track of that, by the way 
I'm not very sure that perspective shouldn't be drawn fyorst.