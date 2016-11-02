<?php

namespace motus;

class Snake {
    
    private $name;
    
    function __construct() {
        $this->name = "ben";
    }

    function getName() {
        return $this->name;
    }
    
}