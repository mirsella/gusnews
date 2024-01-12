https://surrealdb.com/blog/create-a-search-engine-with-surrealdb-full-text-search
https://docs.surrealdb.com/docs/surrealql/statements/define/analyzer/#tokenizers

```
select *, search::score(0) * 10
+ search::score(1) * 2 + search::score(2)
+ search::score(3) * 2 + search::score(4)
as score
from news where tags @0@ 'lemediaexperience'
or tags @1@ 'voyage' or text_body @2@ 'voyage'
or tags @3@ 'sensation forte' or text_body @4@ 'sensation forte'
```
