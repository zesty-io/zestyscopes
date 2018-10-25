{{each star_signs as sign where sign.mascot = '{get_var.mascot}' limit 1 }}
{
	"speechResponse": "{{sign.name}} is the sign which has {{sign.mascot}} as its symbol.",
	"cardTitle": "Star Sign Symbol: {{sign.name}}",
	"cardContent": "{{sign.mascot}} is the symbol for {{sign.name}} which runs from {{sign.start_date}} to {{sign.end_date}}.",
	"cardImage": "{{sign.image.getImage()}}"
}
{{end-each}}