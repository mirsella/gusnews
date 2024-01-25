https://surrealdb.com/blog/create-a-search-engine-with-surrealdb-full-text-search
https://docs.surrealdb.com/docs/surrealql/statements/define/analyzer/#tokenizers

```
select *, search::score(0) * 2 + search::score(1)
+ search::score(2) * 2 + search::score(3)
as score
omit text_body, text_html
from news where array::find_index(tags, 'lemediaexperience') != null
or tags @0@ 'voyage' or text_body @1@ 'voyage'
or tags @2@ 'sensation' or text_body @3@ 'sensation'
```
