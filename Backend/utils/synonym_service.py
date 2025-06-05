import nltk
nltk.download('wordnet')
nltk.download('omw-1.4')
from nltk.corpus import wordnet
import string

def get_synonyms(word):
    """Get synonyms for a word using WordNet"""
    # Clean the word
    word = word.lower().strip().translate(str.maketrans('', '', string.punctuation))
    
    synonyms = set()
    
    # Get synsets for the word
    for syn in wordnet.synsets(word):
        # Get lemma names (synonyms)
        for lemma in syn.lemmas():
            synonym = lemma.name()
            # Only add if different from original word and is a single word
            if synonym != word and '_' not in synonym:
                synonyms.add(synonym)
    
    # Convert to list and sort
    return sorted(list(synonyms))[:10]  # Limit to 10 synonyms

def get_antonyms(word):
    """Get antonyms for a word using WordNet"""
    word = word.lower().strip().translate(str.maketrans('', '', string.punctuation))
    
    antonyms = set()
    
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            if lemma.antonyms():
                antonym = lemma.antonyms()[0].name()
                if '_' not in antonym:
                    antonyms.add(antonym)
    
    return sorted(list(antonyms))
