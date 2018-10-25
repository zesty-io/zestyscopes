{{each alexa_prompts as prompt where prompt.key_name = '{get_var.key}' limit 1 }}
{
	"text": "{{prompt.key_value.escapeForJs()}}"
}
{{end-each}}