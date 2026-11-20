#!/usr/bin/env python3
"""Converts the server-rendered HTML of the deployed build into JSX (markup recovery). Used once to rebuild the sources after the loss of the
original repository: structure, classes, text and inline styles are preserved, behaviour is rewritten separately (src/enhance)."""
import re,sys,json
from html.parser import HTMLParser
VOID={'img','input','br','hr','source','link','meta','area','base','col','embed','track','wbr'}
ATTR={'class':'className','for':'htmlFor','tabindex':'tabIndex','srcset':'srcSet','crossorigin':'crossOrigin','fetchpriority':'fetchPriority','playsinline':'playsInline',
 'viewbox':'viewBox','preserveaspectratio':'preserveAspectRatio','fill-rule':'fillRule','clip-rule':'clipRule','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin',
 'vector-effect':'vectorEffect','autocomplete':'autoComplete','maxlength':'maxLength','readonly':'readOnly','colspan':'colSpan','rowspan':'rowSpan','datetime':'dateTime','enterkeyhint':'enterKeyHint','inputmode':'inputMode',
 'xmlns:xlink':'xmlnsXlink','xlink:href':'xlinkHref','stop-color':'stopColor','stop-opacity':'stopOpacity','fill-opacity':'fillOpacity','stroke-opacity':'strokeOpacity','stroke-dasharray':'strokeDasharray','stroke-dashoffset':'strokeDashoffset',
 'gradientunits':'gradientUnits','gradienttransform':'gradientTransform','clippathunits':'clipPathUnits','text-anchor':'textAnchor','font-size':'fontSize','font-family':'fontFamily','disablepictureinpicture':'disablePictureInPicture','netlify-honeypot':'netlify-honeypot','data-netlify':'data-netlify','autofocus':'autoFocus','novalidate':'noValidate','formnovalidate':'formNoValidate','enctype':'encType','charset':'charSet','referrerpolicy':'referrerPolicy','allowfullscreen':'allowFullScreen'}
STR_OK={'alt','value','defaultValue','placeholder','title','label','content','href','src','name','id','className','sizes','media','srcSet','type','lang','poster'}
NUM={'tabIndex','rows','cols','colSpan','rowSpan','maxLength','size','step'}
BOOL={'hidden','inert','required','disabled','checked','muted','loop','autoplay','playsInline','controls','selected','multiple','readonly','novalidate','async','defer','open'}
def esc_text(t):
    return t.replace('\\','\\\\').replace('{','{"{"}').replace('}','{"}"}').replace('<','{"<"}').replace('>','{">"}')
def style_obj(v):
    parts=[p for p in re.split(r';(?![^(]*\))',v) if p.strip()]
    out=[]
    for p in parts:
        k,_,val=p.partition(':');k=k.strip();val=val.strip()
        if not k: continue
        if k.startswith('--'): key=json.dumps(k)
        else: key=re.sub(r'-([a-z])',lambda m:m.group(1).upper(),k);key=json.dumps(key) if '-' in key else key
        out.append(f'{key}: {json.dumps(val)}')
    has_var=any(o.startswith('"--') for o in out)
    return '{{'+', '.join(out)+'}'+(' as React.CSSProperties' if has_var else '')+'}'
class P(HTMLParser):
    def __init__(s): super().__init__(convert_charrefs=True);s.out=[];s.stack=[]
    def attrs(s,tag,a):
        r=[]
        for k,v in a:
            k0=k;k=ATTR.get(k,k)
            if k0.startswith(('data-','aria-')) or k0=='role': pass
            if tag=='input' and k=='value': k='defaultValue'
            if tag=='textarea' and k=='value': k='defaultValue'
            if k=='style' and v is not None: r.append(f'style={style_obj(v)}');continue
            if v is None or (v=='' and k not in STR_OK and not k.startswith(('data-','aria-'))):
                r.append(k);continue
            if k in NUM:
                r.append(f'{k}={{{int(v)}}}');continue
            if k=='data-magnetic' or (isinstance(v,str) and v in('true','false') and k.startswith('aria-')): r.append(f'{k}="{v}"');continue
            r.append(f'{k}={json.dumps(v,ensure_ascii=False)}')
        return (' '+' '.join(r)) if r else ''
    def handle_starttag(s,tag,a):
        if tag=='script' or tag=='noscript' or tag=='style': s.stack.append(('skip',tag));return
        if s.stack and s.stack[-1][0]=='skip': s.stack.append(('skip',tag));return
        if tag in VOID: s.out.append(f'<{tag}{s.attrs(tag,a)} />');return
        s.out.append(f'<{tag}{s.attrs(tag,a)}>');s.stack.append(('el',tag))
    def handle_startendtag(s,tag,a):
        if s.stack and s.stack[-1][0]=='skip': return
        s.out.append(f'<{tag}{s.attrs(tag,a)} />')
    def handle_endtag(s,tag):
        if tag in VOID: return
        if not s.stack: return
        kind,t=s.stack.pop()
        if kind=='skip': return
        s.out.append(f'</{tag}>')
    def handle_data(s,d):
        if s.stack and s.stack[-1][0]=='skip': return
        if not d.strip() and '\n' in d: return
        s.out.append(esc_text(d))
    def handle_comment(s,d): pass
def convert(html):
    p=P();p.feed(html);j=''.join(p.out)
    j=re.sub(r'<(\w+)([^<>]*?)></\1>',lambda m:f'<{m.group(1)}{m.group(2)} />' if m.group(1) in ('path','circle','rect','line','polyline','polygon','ellipse','stop','use','span') and False else m.group(0),j)
    return j
if __name__=='__main__':
    print(convert(open(sys.argv[1]).read()))
