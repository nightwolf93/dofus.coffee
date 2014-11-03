Dofus.coffee
===================

**Dofus.coffee** est un émulateur pour Dofus **v1.29.1** écris en **CoffeeScript**.
Celui-ci n'est **pas à prendre au sérieux** c'est juste pour tester un concept de serveur léger pouvant **s'installé rapidement (via npm par exemple) **

Installation
===================

Télécharger tout simplement le dossier dist et exécuter

> cd ../votre/dossier/
> node dofus

La configuration se fait via le fichier **config.yml**

    sql:
	    host: '127.0.0.1'
		username: 'root'
		password: ''
		database: 'votre base'

		auth:
		  port: 444

		game:
		  port: 5556
