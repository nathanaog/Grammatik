import re
head=open('head.html').read()
gen=re.sub(r"if \(typeof module[\s\S]*$","",open('gen.js').read())
out=head+open('data.js').read()+"\n"+gen+"\n"+open('app.js').read()+"\n</script>\n</body>\n</html>\n"
open('../index.html','w').write(out)
print(len(out))
