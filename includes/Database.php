<?php

class Database {

    private $_connection;
    protected static $_instance; //The single instance
    private $_host = 'localhost';
    private $_username = 'liambouj_motus';
    private $_password = 'ZZxDLmie]%-L';
    private $_database = 'liambouj_motus';

    /*
      Get an instance of the Database
      @return Instance
     */
    public static function getInstance() {
        if (!self::$_instance) { // If no instance then make one
            self::$_instance = new self();
        }
        return self::$_instance;
    }

// Constructor
    private function __construct() {
        try {
            $this->_connection = new \PDO("mysql:host=$this->_host;dbname=$this->_database", $this->_username, $this->_password);
        } catch (PDOException $e) {
            echo $e->getMessage();
        }
    }

// Magic method clone is empty to prevent duplication of connection
    private function __clone() {
        
    }

    public function register_user($uname, $upass, $admin, $perm) {
        try {
            $password = password_hash($upass, PASSWORD_DEFAULT);
            $stmt = $this->_connection->prepare("INSERT INTO user(name,pass,admin,permission_level) 
                                                VALUES(:user_name, :user_pass, :admin, :perm)");
            $stmt->bindparam(":user_name", $uname);
            $stmt->bindparam(":user_pass", $password);
            $stmt->bindparam(":admin", $admin);
            $stmt->bindparam(":perm", $perm);
            if ($stmt->execute() === true) {
                return true;
            } else {
                return false;
            }
        } catch (PDOException $ex) {
            echo $ex->getMessage();
        }
    }

    private function generatePassword($length = 8) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $count = mb_strlen($chars);

        for ($i = 0, $result = ''; $i < $length; $i++) {
            $index = rand(0, $count - 1);
            $result .= mb_substr($chars, $index, 1);
        }

        return $result;
    }

    public function login_user($username, $password) {

        $stmt = $this->getConnection()->prepare("SELECT * FROM `user` WHERE name=:uname");
        $stmt->bindParam(":uname", $username);

        $stmt->execute();

        //adds fallback classes incase using older version of PHP
        require_once 'passwordLib.php';

        while ($rows = $stmt->fetch()) {
            if (password_verify($password, $rows['pass'])) {
                return true;
            } else {
                return false;
            }
        }
    }

    //get last inserted ID
    public function lastInsertId() {
        return $this->_connection->lastInsertId();
    }

    // Get mysql pdo connection
    public function getConnection() {
        return $this->_connection;
    }

}
