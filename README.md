# Taint Tracking Demo
A fork of [VulnNodeApp](https://github.com/4auvar/VulnNodeApp), which requires `Graal.js`. It was extended to provide taint tracking to detect SQL and command injections.

## Setup
### Clone this repository

```bash
git clone https://github.com/lweides/taint-tracking-demo.git
```

### Application setup:
- Install `Graal.js`
    - Clone [Truffle](https://github.com/lweides/graal)
    - Clone [Graal.js](https://github.com/lweides/graaljs)
- Navigate into the `graal-nodejs` folder.
- Run command: `mx npm install --prefix /path/to/this/folder`
 
### DB setup
You can either use `docker`, which allows the usage of the provided scripts `setup-db` and `populate-db`,
or you can run a local `mysql` instance.

#### Docker
- Run `mx npm run setup-db --prefix path/to/this/directory`
- Run `mx npm run populate-db --prefix path/to/this/directory`

#### Local
Log into the database as root and execute the SQL statements below. (I recommend `mysql` version `5.7`).
```sql
CREATE USER 'vulnnodeapp'@'localhost' IDENTIFIED BY 'password';
create database vuln_node_app_db;
GRANT ALL PRIVILEGES ON vuln_node_app_db.* TO 'vulnnodeapp'@'localhost';
USE vuln_node_app_db;
create table users (id int AUTO_INCREMENT PRIMARY KEY, fullname varchar(255), username varchar(255),password varchar(255), email varchar(255), phone varchar(255), profilepic varchar(255));
insert into users(fullname,username,password,email,phone) values("test1","test1","test1","test1@test.com","976543210");
insert into users(fullname,username,password,email,phone) values("test2","test2","test2","test2@test.com","9887987541");
insert into users(fullname,username,password,email,phone) values("test3","test3","test3","test3@test.com","9876987611");
insert into users(fullname,username,password,email,phone) values("test4","test4","test4","test4@test.com","9123459876");
insert into users(fullname,username,password,email,phone) values("test5","test5","test5","test5@test.com","7893451230");
```

## Running the application
Start the application with the command `mx npm run start --prefix path/to/this/directory` (again issued in the `graal-nodejs` directory)
The application should now be running on [localhost](http://localhost:3000)

### SQL injection
One can login using an arbitrary email and the following password: `test' OR 1=1; -- test`.
For testing purposes, `test' OR 1=1; --test` might be usefull. No whitespace after the comment
violates the `mysql` syntax, so the user is not logged in. The taint warning, however, is still logged.

### Command injection
To test the command injection, navigate to [command injection](http://localhost:3000/command-injection).
Simply enter an arbitrary host, followed by `&& some command with args`, for example:
`google.com && echo "Hello World"`.
