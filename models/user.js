/**
 * Created by JBH on 2015/3/24.
 */

/**
 * MVC Model
 * @param user
 * @constructor
 */
function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;