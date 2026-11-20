#!/usr/bin/env python3
"""Rebuilds page sources from the server-rendered HTML of the deployed v7 build (markup recovery), normalising repeated parts into components
(Logo, Pulse, PulseTitle). Behaviour lives in src/enhance and src/components, written by hand."""
import re,os,sys,json,html
sys.path.insert(0,os.path.dirname(__file__))
from html2jsx import convert
REF='/home/user/ref';OUT=os.path.join(os.path.dirname(__file__),'..','src')
ROUTES={'/':'index.html','/work/':'work/index.html','/work/cullinan-belek/':'work/cullinan-belek/index.html','/work/voyage-belek/':'work/voyage-belek/index.html','/work/ng-phaselis-bay/':'work/ng-phaselis-bay/index.html','/work/titanic-belek/':'work/titanic-belek/index.html',
 '/experiences/':'experiences/index.html','/experiences/noema/':'experiences/noema/index.html','/experiences/xoxo/':'experiences/xoxo/index.html','/experiences/hypnotized/':'experiences/hypnotized/index.html','/experiences/casa-del-ritmo/':'experiences/casa-del-ritmo/index.html',
 '/studio/':'studio/index.html','/contact/':'contact/index.html','/privacy/':'privacy/index.html'}
def body(path):
    s=open(os.path.join(REF,path)).read();return s[s.index('<body'):]
CMP=[]
def ph(jsx):
    CMP.append(jsx);return 'ZZCMP%dZZ'%(len(CMP)-1)
def normalise(h):
    # PulseTitle
    def pt(m):
        blk=m.group(0)
        tag=re.search(r'<(h[12])\b',blk).group(1);cls=re.search(r'<h[12][^>]*class="([^"]*)"',blk).group(1)
        wrap=re.match(r'<div class="pulse-title ?([^"]*)"',blk).group(1).strip()
        lines=[]
        for ln in re.findall(r'<span class="mask-line pt-line"[^>]*>(.*?)</span></span>(?=<span class="mask-line pt-line"|</h|$)',blk,re.S):
            t=re.sub(r'<[^>]+>','',ln);lines.append(html.unescape(t).strip())
        if not lines:
            lab=re.search(r'aria-label="([^"]*)"',blk).group(1);lines=[html.unescape(lab)]
        line=('<svg' in blk)
        amp=22 if 'text-giga' in cls else 16 if 'text-h2' not in cls else 12
        when='"view"' if tag=='h2' else '"load"'
        return ph('<PulseTitle as="%s" lines={%s} className="%s" when={%s} amp={%d}%s%s />'%(tag,json.dumps(lines,ensure_ascii=False),cls,when,amp,'' if line else ' line={false}',(' wrapperClass="%s"'%wrap) if wrap else ''))
    h=re.sub(r'<div class="pulse-title[^"]*">.*?</svg></div>',pt,h,flags=re.S)
    h=re.sub(r'<div class="pulse-title[^"]*">(?:(?!<div class="pulse-title).)*?</h[12]></div>',pt,h,flags=re.S)
    # Pulse
    def pulse(m):
        tag=m.group(0);cls=re.search(r'class="([^"]*)"',tag).group(1);cls=re.sub(r'\b(pulse|block|w-full|overflow-visible)\b','',cls).strip()
        hh=re.search(r'viewBox="0 0 1000 (\d+)"',tag);hgt=int(hh.group(1)) if hh else 36
        return ph('<Pulse className="%s" height={%d} />'%(cls,hgt))
    h=re.sub(r'<svg[^>]*viewBox="0 0 1000 \d+"[^>]*class="pulse[^"]*"[^>]*>.*?</svg>',pulse,h,flags=re.S)
    h=re.sub(r'<svg[^>]*class="pulse[^"]*"[^>]*viewBox="0 0 1000 \d+"[^>]*>.*?</svg>',pulse,h,flags=re.S)
    # Logo
    def logo(m):
        cls=re.search(r'class="([^"]*)"',m.group(0)).group(1)
        return ph('<Logo className="%s" />'%cls)
    h=re.sub(r'<svg[^>]*viewBox="115 52 1204 398"[^>]*>.*?</svg>',logo,h,flags=re.S)
    def flat(m):
        y=float(m.group(1));return 'd="ZZFLAT%dZZ"'%round(y*2)
    h=re.sub(r'd="M0\.0 ([\d.]+)L[^"]{400,}"',flat,h)
    return h
def to_tsx(h):
    h=normalise(h)
    j=convert(h)
    for i,c in enumerate(CMP): j=j.replace('ZZCMP%dZZ'%i,c)
    j=re.sub(r'd="ZZFLAT(\d+)ZZ"',lambda m:'d={flatPulse(1000, %s)}'%m.group(1),j)
    return j
def write(path,text):
    os.makedirs(os.path.dirname(path),exist_ok=True);open(path,'w').write(text)
if __name__=='__main__':
    seo=json.load(open(os.path.join(os.path.dirname(__file__),'..','seo_extract.json')))
    # chrome from the home page
    b=body('index.html');i=b.index('<main');j=b.index('</main>')+7
    before=b[:i];after=b[j:]
    for r,p in ROUTES.items():
        bb=body(p);a=bb.index('<main');z=bb.index('</main>')
        inner=bb[a:z+7];inner=re.sub(r'^<main[^>]*>','',inner);inner=inner[:-7]
        jsx=to_tsx(inner)
        name='Page'
        slug=r.strip('/').replace('/','_') or 'home'
        imports=['import { Pulse } from "@/components/Pulse";','import { PulseTitle } from "@/components/PulseTitle";','import { Logo } from "@/components/Logo";']
        use=[n for n in ('Pulse','PulseTitle','Logo') if '<'+n in jsx]
        if 'flatPulse' in jsx: imports.append('import { flatPulse } from "@/lib/pulse";');use.append('flatPulse')
        imp='\n'.join(x for x in imports if any('{ '+n+' }' in x for n in use))
        meta=seo.get(r,{})
        t=(meta.get('title') or '').replace(' · CDB Production','')
        mt='export const metadata = %s;\n'%json.dumps({'title':t if r!='/' else {'absolute':meta.get('title')},'description':meta.get('description'),'alternates':{'canonical':r}},ensure_ascii=False)
        # JSX needs a single root: wrap in fragment
        code='%s\n\n%s\nexport default function Page() {\n  return (\n    <>\n%s\n    </>\n  );\n}\n'%(imp,mt,jsx)
        dest=os.path.join(OUT,'app',r.strip('/'),'page.tsx') if r!='/' else os.path.join(OUT,'app','page.tsx')
        write(dest,code);print(r,len(jsx))
    # chrome
    write(os.path.join(OUT,'components','chrome','before.tsx'),'import { Logo } from "@/components/Logo";\n\nexport function Before() {\n  return (\n    <>\n%s\n    </>\n  );\n}\n'%to_tsx(re.sub(r'^<body[^>]*>','',before)))
    write(os.path.join(OUT,'components','chrome','after.tsx'),'import { Logo } from "@/components/Logo";\nimport { Pulse } from "@/components/Pulse";\n\nexport function After() {\n  return (\n    <>\n%s\n    </>\n  );\n}\n'%to_tsx(re.sub(r'</body>.*$','',after,flags=re.S)))
