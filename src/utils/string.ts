

export function to_sentence_case(str: string)
{
    return str.charAt(0).toUpperCase() + str.slice(1).replaceAll("_", " ")
}
