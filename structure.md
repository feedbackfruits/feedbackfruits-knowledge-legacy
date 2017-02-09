# Structure

This document provides an overview on the structure of FeedbackFruits Knowledge on different levels.

## Graph infrastructure
> Note: The diagram below requires [mermaid](https://github.com/knsv/mermaid). See also [live editor](http://knsv.github.io/mermaid/live_editor/) and  [atom package](https://atom.io/packages/markdown-preview-enhanced).

```{mermaid}
graph LR
    %% Node definitions
    MAG[Microsoft Academic Graph Entitizer]
    TED[TED Entitizer]
    YT[YouTube Entitizer]
    Quora[Quora Entitizer]
    FBF[FeedbackFruits Entitizer]

    API[FeedbackFruits  API]

    Bus[Bus - Memoid/Kafka]
    DB[Graph DB - Cayley?]
    Index[Index - Elasticsearch?]

    Knowledge[FeedbackFruits Knowledge]
    UI[Knowledge UI]

    %% Edges
    MAG --> Bus
    TED --> Bus
    YT --> Bus
    Quora --> Bus
    FBF --> Bus
    FBF --> API

    Bus --> DB
    Bus --> Index

    DB --> Knowledge
    Index --> Knowledge

    Knowledge --> API
    Knowledge -- GraphQL --> UI
```

## Entitizers
Knowledge is stored in the graph by relating something to an existing topic. The entitizers will add knowledge to the graph by through the bus, by relating the context specific content to topics in some way, e.g. topic extraction. Entitizers could make use of:
- (Pull-based) A scraper
- (Push-based) An external pull based API and a feed of updates

## The graph
The knowledge graph serves as a way to traverse what we know about the internet. It contains **pointers to external resources** that are related to a topic in some way. The topics are based on the Microsoft Academic Graph fields of study, which have a one-to-one relationship to DBPedia. The graph is built up by listening to the bus and storing everything in a graph database. Similarly and simultaneously, the data can be stored in an index to provide quick suggestions.

## FeedbackFruits Knowledge
This service will provide a GraphQL API as an interface to the graph databse and the index. It aggregates the complex structure of the underlying API to provide a relatively simple interface for the UI to talk to.

## GraphQL
GraphQL will serve as an API to the graph database.

### Types
- Topic (based on MAG topics)
  - Id (dbpedia id)
  - Name
  - Description
  - Subtopics
  - Supertopics
- Person (based on MAG authors and dbpedia entities)
  - Id (dbpedia id)
  - Name
  - Topics
- Resource (based on entitizers)
  - Id (external url)
  - Type
  - Time info (created, updated, changelog)
  - Topics

## Suggestions
Resources are suggested through Elasticsearch. Possible resources are:
- Media
  - Documents
  - Videos
  - Websites
- Questions/answers/thoughts
  - Quora
  - Stackexchange
  - Reddit
  - Twitter

## Link to FeedbackFruits API
- Entitizing media
- Authorization/scoping
- From resource to activity
