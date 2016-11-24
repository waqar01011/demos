# ANSIBLE DEPLOY 

This is the ansible playbook, that deploys the node app for the [second screen demo](http://artofrawr.com/demos/secondscreen) to a server.

It's commited to GitHub only for educational purposes and cannot be executed without the required SSH key to access the server (which is obviously not included).

The playbook would be run like this:

        ansible-playbook nodeapp.yml -i hosts --private-key /location/of/key -u username

## Links: 

* [live demo](http://artofrawr.com/demos/secondscreen) 
* [frontend source](https://github.com/artofrawr/demos/tree/master/secondscreen/frontend) 
* [nodejs source](https://github.com/artofrawr/demos/tree/master/secondscreen/node) 


