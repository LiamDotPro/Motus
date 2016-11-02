<?php

namespace motus;

class Snake {
    
    private $name;
    
    function __construct($name) {
        $this->name = "ben";
    }

    function getName() {
        return $this->name;
    }
    
}