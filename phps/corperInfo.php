<?php
    class corperInfo{
        public $firstName;
        public $lastName;
        public $address;
        public $ServiceState;
        public $batch;
        public $PPA;

        public function __construct (string $firstName, string $lastName, array $address, string $ServiceState, string $batch, string $PPA ){
            $this->$firstName = $firstName;
            $this->$lastName = $lastName;
            $this->address = $address;
            $this->$ServiceState = $ServiceState;
            $this->$batch = $batch;
            $this->$PPA = $PPA;
        }
    }
?>