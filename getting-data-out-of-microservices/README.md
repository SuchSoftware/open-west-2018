# Getting data out of microservices

Microservices are autonomous. They don't ask questions; they don't answer questions. They do observe and emit asynchronous messages, but your users, want to see usable information and not just a log of everything that happened. _You_ need this too, because you need to know if your system is working. How do we turn streams of events into something usable for us and our users? How do we render UIs while still keeping our concerns separate and not devolving back into a monolithic architecture? This talk will answer these fundamental questions.

We'll cover:

* The fundamentals of Command-Query Responsibility Segregation and see how this technique integrates seamlessly with event sourcing to produce robust, adaptable systems that make our users happy
* The considerations between eventual consistency and immediate consistency and when to apply each
* The power of being able to mold data into as many shapes as we need to meet our needs, including ones we didn't think of in the beginning
* Fixing bugs in our data

A mixture of code and concepts, you'll leave this talk knowing how to get microservices to play well together and make your architecture better.

[Slides][https://docs.google.com/presentation/d/1bg5cqbiq0m_cgy6ae8buw72jzec3qybhkirsq9hwgrc/edit#slide=id.p]
