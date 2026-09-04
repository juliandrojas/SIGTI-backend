class User {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}

class Admin extends User {
    constructor(id, name, email, role) {
        super(id, name, email);
        this.role = role;
    }
}

export { Admin, User };

