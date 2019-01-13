<?php
    class corperReg{
        public $email;
        public $password;

        public function __construct (sting $email, string $password ){
            $this->$email = $email;
            $this->$password = $password;
        }

        public function insert() : bool {

        }
    }
?>