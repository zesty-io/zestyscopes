[
{{each star_sign_traits as traits}}
	{
		"sign": "{{star_signs.filter(z.zuid = '{traits.sign}').name }}",
		"traits": "{{trait.traits.escapeForJs()}}"
	}{{if {traits._length} != {traits._num} }},{{end-if}}
{{end-each}}
]