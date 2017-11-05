### REACTIVE FRAMEWORK

#### Problème
morphdom fait une oppération pas immutable sur le second paramettre, c'est à dire la target.
C'est hyper relou parce que ça mute les valeurs qui sont contenu dans les observable idle donc la valeur est récupérée au combine latest. Du coup ce qui est émit la deuxième n'est plus le dom que l'on veut représenter mais le dom modifier par morphdom.
La modification en question est carrement de supprimer des enfants du dom target.

Clarification :
si ma target est `<ul><li>lol</li></ul>`,
quand je fais `morphdom(el, target)`
morphdom va modifier target, qui sera alors égale à `<ul></ul>`.
C'est très chiant parce que cette variable (target) est contenu dans le state
de `Observable.combineLatest()`, qui stock les dernières valeurs émise de tous les observables
pour rémettre le tout à chaque update.


#### solution
Pour solutionner le problème, il faut arreter d'utiliser morphdom et plutôt émettre du virtualdom.
donc trouver une librairy qui transform des tagged string de html en vDOM et
diff ce vDOM dans le render.
