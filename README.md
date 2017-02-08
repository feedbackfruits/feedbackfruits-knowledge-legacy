# FeedbackFruits Knowledge
> You know, for knowledge!

FeedbackFruits Knowledge graph API.

## Roadmap
### Existent components
- Bo’s automatic question generator provides us with questions for a given topic
- Boyang’s work on youtube and TED recommendations provides us with videos for a specific - topic
- Pim and Yope’s work on practice sets allows students to practice a certain topic

### To be developed
- Entities back-end. So far, we’ve used DBPedia to provide entities. These entities may not - all be relevant, and the structure of DBPedia’s graph doesn’t fully suit our needs from an - academic perspective. Microsoft’s Academic Graph may solve this for us.
- A clear and thought-out UI. Felix has made some designs but it may serve us to iterate on those based on the additional insights we’ve gained.

## Values
- Simplicity and overview
- Do not take focus away from important activities.
- Empower students
- Do not take (perceived) power away from teachers.

## Goals
- Provide **context** for a student’s current focus topic
- Allow **exploration** of related topics
- Facilitate **discussion** through Q&A on topics
- Provide students with **related material** to study topics

### Context
Providing context allows students to better put their knowledge into perspective. We show how the current topic relates to other topics (broader, narrower and similar topics).

We show what topics relate to a student’s current material. We should figure out the precision of this: we can do it either locally (at the point where the student encounters a certain topic, i.e. a position in a video, sentence/word in a document) or globally (for an entire activity).

### Exploration
By facilitating exploration students can better find topics they find interesting or relevant. We do this by allowing students to either go deeper or broader.
We show related topics.
We provide material that combines the current topic with others, or dives deeper into the topic.

### Discussion
#### Some ideas
- Show ‘friends’ who we know have studied the topic
- Show pioneers/influential people in certain fields
- Allow users to subscribe to topics to help out with questions
- Show a feed of new questions or discussions of topics a user has viewed / studied.
- Show the amount of time spent on each topic, possibly in relation to the total amount - spent. Represent your current ‘focus’.
- Github punchcard-like timeline for each topic/person
- Learn/practice topic with FeedbackFruits (hook new users)

### Additional material
We provide material to allow students to quickly gain knowledge on the topic. This material comes both from inside and outside the platform. This means that:
1. We attempt to find topics in material on FeedbackFruits
1. We search and index material on the Web for topics

In addition, we will also allow students and teachers to add their own material to topics.

#### Questions
Bo is working on an extracting questions from various sources on the Web, and on automatically generating them from topics.

#### Videos
There’s an abundance of video material on all kinds of topics. Tapping into this will be of great value.

#### Documents
There are quite a few open-access books, but their sheer size (number of pages) might make it difficult for us to accurately recommend things. Should investigate.

#### Other
Besides that, there seem to be a lot of slides freely available online. We should look into that as well.

Additionally, the Microsoft Academic Graph includes a lot of papers. If we can make those available easily, this could provide a starting point for a foothold in the market of academic research.

## User stories
A user is watching a video on FeedbackFruits. They prefer videos over other types of material, and are an avid Youtuber. They watch a video of a lecture which their professor uploaded on FeedbackFruits. They weren’t paying attention during the previous lecture, and in the current video the teacher keeps on using a term they don’t understand very well. How can we help the user in their struggles?
