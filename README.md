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

```
define table lme as select *, search::score(0) * 10
as score
from news where tags @0@ 'lemediaexperience'
```

maybe a columns with images from the articles

https://www.geo.fr/
https://www.en-vols.com/
https://www.nationalgeographic.fr/
https://capturetheatlas.com/photo-tours/
https://www.lonelyplanet.fr/
https://www.nationalgeographic.com/pages/topic/yourshot
https://www.magnumphotos.com/arts-culture/the-magnum-holiday-gift-guide/
https://www.travelandleisure.com/
https://www.atlasobscura.com/
https://www.bbcearth.com/nature
https://www.wwf.fr/
https://www.earthshots.org/
https://landscapephotographymagazine.com/
https://www.nationalgeographic.fr/auteur/national-geographic-traveler
https://www.bbc.com/travel
https://www.theguardian.com/uk/travel
https://www.smithsonianmag.com/category/africa-middleeast/
https://www.naturesbestphotography.org/
https://www.nhm.ac.uk/wpy/gallery
