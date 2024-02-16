const OpenAi = require('openai');
const openai = new OpenAi();

function OpenAI(){}
module.exports = OpenAI;

/**
 * Asks the almighty one to generate me a comprehensive comic
 * @param {String} phrase Seed phrase of the comic
 * @param {String} title Title of the comic
 * @param {String} talkingChars ex 'abac'
 * @returns 
 */
OpenAI.prototype.generateComicText = async function(phrase, title, talkingChars) {
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0125',
        response_format: { "type": "json_object" },
        messages: [
            {
                role: 'system',
                content: `I am going to give you a title, phrase, and a character list. 
                You will generate a 4 phrase conversation between the characters in the character list.

                The title will be the title of the conversation.
                It will set the theme of the conversation.

                The phrase will help you think of similar things to set the theme and mood of the conversation.

                The character list is a little more complicated. The character list will be a 
                string of four lowercase letters. Each unique letter will correspond to a character talking in the conversation. 
                The character list is to guide you so you may generate a conversation structure that makes sense considering
                the number of characters in the conversation and which characters are talking in which order.
                There will be some special cases I will explain later.

                Using these three inputs, generate me a sensical conversation with the information I have provided.
                Think through the whole conversation, structure, characters, theme, etc. and then generate the conversations text.
                I will provide some examples to elaborate how I want you to structure each conversation.


                CAVEAT for character list! - The letter 'z' is code for a transition that does not need text! Please just pass the empty string for this case. 
                
                You will generate text for every letter but 'z'.
                The order of the character list directly corresponds in which order the phrases will be said.


                EXAMPLE 1: Character List - 'afaf'
                This is an example of a conversation that contains two characters 'a' and 'f'. In the 
                character list they are alternating. This means that the 'a' will speak, then 'f', then 'a', and then 'f' last.

                Now lets go through this in depth.
                Lets first look at the character list. The first letter is 'a'. This means that for
                the first phrase, you will keep in mind character 'a' is talking. Everytime we see 'a' from now on, 
                it will be referencing this same character. We now can move to the next letter. 

                The next letter is 'f'. This means there is a new unique character 'f'. He is the one who will be talking in the
                second phrase.

                The next letter in the character list is 'a'. We already have a character for the letter 'a'. This means
                that this is the same character from the first phrase. So for the third phrase character 'a' will be talking.

                The last letter is 'f'. We already have a character for 'f'. So this means 'f' is talking on this last phrase.

                Now that we know how many characters we have, and in which order they are talking, now generate text for conversation.
                In an example like this ('afaf') I would expect a back and forth conversation or some friendly banter between two friends. 
                
                This is an in depth example of how you should analyze these character strings.
                Pay real close attention to the number of characters and who is talking.
                NEVER generate the same phrase 4 times.

                I will go through some more examples in less detail

                EXAMPLE 2: Character List - 'aaff' 
                There are two characters again but this time it is character 'a' saying the first two phrases.
                Since this is the same character talking, the first two phrases need to make sense when put together
                keeping in mind that this is the same character talking. The next two letters in the character list 
                are 'f'. So now character 'f' gets two phrases to reply to character 'a'. Here is an example of good output
                for these cases = ['Hey man.', 'How are you doing?', 'I am good', 'I saw a good movie the other day']

                EXAMPLE 3: Character List - 'zacf'
                This time the conversation starts with a transition. This will be need to be
                accounted for when structuring the conversation since transitions don't get text. 
                After the transition,there are three characters in the conversation who all say one thing.

                EXAMPLE 4: Character List - 'aaaa'
                This would be a conversation where character 'a' is speaking only to himself. So the structure of the conversation 
                could be some internal dialouge with himself.

                EXAMPLE 5: Character List - 'zzzz' 
                All transition conversations. No need to generate any text.

                OUTPUT: 
                I would like the format to be in a JSON format. Exactly like this. I do not need to know 
                which character is talking in the output. The output should be in the same order
                that the character list is.
                {
                conversation: [
                    'phrase 1',
                    'phrase 2', 
                    'phrase 3', 
                    'phrase 4'
                ]
                }
                
                Again, I expect the number, order of characters talking, phrase, and title to be taken 
                into consideration before generating this text. Thank you, wise one.`                
            },
            {
                role: 'user',
                content: `Title: ${title}, Phrase: ${phrase}, Character list: ${talkingChars}`
            }
        ]
    });

    console.log('Token used -- ', completion['usage']['total_tokens']);
    var x = JSON.parse(completion.choices[0].message.content);
    return x;
}