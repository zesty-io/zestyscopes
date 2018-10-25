{{each star_signs as sign where sign.mascot = '{get_var.mascot}' limit 1 }}
{
	"name": "{{sign.name}}",
	"mascot": "{{sign.mascot}}",
	"image": "{{sign.image.getImage()}}",
	"startDate": "{{sign.start_date}}",
	"endDate": "{{sign.end_date}}"
}
{{end-each}}