import javascript

predicate underSrcPath(StringLiteral n) {
    n.getFile().getAbsolutePath().indexOf("/home/PPAEG/src/pre-analysis/")=0
}

from StringLiteral s
where 
    underSrcPath(s) and 
    s.getRawValue().charAt(0) = "'" or s.getRawValue().charAt(0) = "\""
select s