[
{{each horoscope as reading }}
{
	"sign": "{{star_signs.filter(z.zuid = '{reading.sign}').name }}",
	"date": "{{reading.date}}",
	"reading": "{{reading.horoscope}}"
}{{if {reading._length} != {reading._num} }},{{end-if}}
{{end-each}}
]