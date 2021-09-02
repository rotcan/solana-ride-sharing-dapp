Simple Ride Sharing concept dapp for Build out loud Solana hackathon. 

This application uses Arweave to store profile information, Solana for storing rides and payment. There is a centralized part for sharing customer ride details to drivers. For test purposes 8 dummy locations are stored and are used to create dummy ride between customers. No maps are used.

To run the application we need to do the following.
1) Deploy the so file in dist/program/cabaggprogram.so to solana cluster

2) Run arweave docker image as explained in this link <a href="https://github.com/ArweaveTeam/testweave-docker">Arweave Docker Github</a>

3) Run node js server with command "npm run server"

4) Run react front-end with command "npm run start"

Limitations :-
1) No maps

2) Driver can only select upto to max 3 customer rides

3) Customer can only select 4 driver options 

4) Program can panic at any given stage

*a lot of boundary conditions are not checked and cleanup is required*
By Rahul Srivastava
