import numpy as np, math, random
from PIL import Image, ImageDraw, ImageFilter
random.seed(21); np.random.seed(21)
W,H=2600,560
SS=2  # supersample
img=Image.new('RGBA',(W*SS,H*SS),(0,0,0,0))
d=ImageDraw.Draw(img)
navy=np.array([20,37,61])
top_m, bot_m = 22, 26          # margins inside the image
n=380
for i in range(n):
    t=i/(n-1)                      # 0 top .. 1 bottom
    y0=top_m+(H-top_m-bot_m)*t + random.uniform(-2,2)
    edge=min(t,1-t)                # 0 at edges, .5 middle
    # bristles near the edges are thinner, fainter and shorter
    thick=random.uniform(2.2,5.5)*(0.55+0.9*min(1,edge*4))
    alpha=int(255*random.uniform(.72,1)*(0.55+0.45*min(1,edge*5)))
    shade=random.uniform(-.10,.12)
    col=np.clip(navy*(1+shade)+ (255*max(0,shade)*0.25),0,255).astype(int)
    # where the paint runs out: mostly 82-100% of the length, edges earlier
    end=W*random.uniform(.86,.985)*(0.93+0.07*min(1,edge*4))
    start=random.uniform(0,18)+ (1-min(1,edge*4))*random.uniform(0,40)
    amp=random.uniform(1,3); f=random.uniform(.0012,.003); ph=random.uniform(0,6.28)
    slope=0
    x=start; segs=[]
    while x<end:
        step=random.uniform(18,46)
        frac=x/end
        # dry brush: gaps appear toward the end of each bristle
        if frac>0.8 and random.random()<(frac-0.8)*2.2:
            x+=step*random.uniform(.6,2.2); continue
        x2=min(end,x+step)
        segs.append((x,x2)); x=x2
    for (a,b) in segs:
        pts=[]
        for xx in np.linspace(a,b,4):
            yy=y0+amp*math.sin(xx*f+ph)+slope*xx*W*0.02 + (H*0.012)*math.sin(xx*0.0009+1.3)
            pts.append((xx*SS,yy*SS))
        frac=b/end
        w=thick*(1-0.45*max(0,frac-0.8)/0.2)
        d.line(pts,fill=(int(col[0]),int(col[1]),int(col[2]),alpha),width=max(1,int(w*SS)),joint='curve')
# fill tiny gaps in the body so it reads as paint, keep streak texture
img=img.resize((W,H),Image.LANCZOS)
a=np.array(img).astype(float)
body=Image.new('RGBA',(W,H),(0,0,0,0)); bd=ImageDraw.Draw(body)
poly=[]
for xx in np.linspace(10,W*0.88,80): poly.append((xx,top_m+14+5*math.sin(xx*0.004)))
for xx in np.linspace(W*0.88,10,80): poly.append((xx,H-bot_m-14+5*math.sin(xx*0.0035+2)))
bd.polygon(poly,fill=(20,37,61,215))
body=body.filter(ImageFilter.GaussianBlur(10))
base=np.array(body).astype(float)
xs=np.arange(W)
fade=np.clip((W*0.86-xs)/(W*0.16),0,1)
base[:,:,3]*=fade[None,:]
# composite bristles over the softened body
out=base.copy()
aa=a[:,:,3:4]/255; ab=base[:,:,3:4]/255
oa=aa+ab*(1-aa)
out[:,:,:3]=np.where(oa>0,(a[:,:,:3]*aa+base[:,:,:3]*ab*(1-aa))/np.maximum(oa,1e-6),0)
out[:,:,3:4]=oa*255
Image.fromarray(out.clip(0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)).save('/home/claude/jiannashao.github.io/web/brush-stroke.png',optimize=True)
prev=Image.new('RGB',(W,H),'#fafafa'); prev.paste(Image.open('/home/claude/jiannashao.github.io/web/brush-stroke.png'),(0,0),Image.open('/home/claude/jiannashao.github.io/web/brush-stroke.png'))
prev.resize((W//2,H//2)).save('/tmp/claude-0/shots/brush-prev.png')
