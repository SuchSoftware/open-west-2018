# Build an Event Store

Talk from OpenWest 2018

You've bought into microservices. You've bought into _evented_ microservices, and you're even looking at using event sourcing. You see the value of decoupling separate concerns temporally as well as spatially. You want long-term productivity and reliability in your system, and you're willing to learn new techniques to get there.

But now what? How do you get events from one location to another? Should you use a broker like Kafka or RabbitMQ? SQS? Kinesis? Redis? CouchDB? What features does your event store need to support? Is it more than just moving messages from point A to point B? Where do familiar technologies like RDBMS fit into this?

This is going to be a hands-on talk where we answer these questions and actually implement an event store on top of PostgreSQL. The code will be JavaScript running in Node.js, but the principles will hold for any language. We'll implement a simple event store suitable for use in production and see how an event store differs from a message broker. We'll also see that it's not that difficult to get up and running.

[Slides](https://docs.google.com/presentation/d/1VchgnabItiqb_ScOj7q9znIOlfKyzcljjt0uYEc6sBs/edit?usp=sharing)
