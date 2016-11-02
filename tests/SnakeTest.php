<?php
class SnakeTest extends PHPUnit_Framework_TestCase {
	protected $obj = NULL;
	
	protected function setUp() {
		$this->obj = new motus\Snake;
	}

	
	    /**
         * @return string persons name
         */
        public function testGetName(){
            $this->assertTrue($this->obj->getName() == "ben");
        }


        protected function tearDown() {
		unset($this->obj);
	}
}
?>