{{each star_signs as sign where sign.name = '{get_var.sign}' limit 1 }}
{
	"speechResponse": "People with birthdays between {{sign.start_date}} and {{sign.end_date}} have {{sign.name}} as their sign.",
	"cardTitle": "Dates for {{sign.name}}",
	"cardContent": "{{sign.name}} is the sign for people born between {{sign.start_date}} and {{sign.end_date}}.",
	"cardImage": "{{sign.image.getImage()}}"
}
{{end-each}}
