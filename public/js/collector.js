/**
 * Created by li on 03/03/2017.
 */

function Collector() {

    this.queue = new Queue();

}


function Queue() {

    this.processor = new Processor();

    this.createTicket = function (Ticket) {

    }

    this.processTicket = function (Ticket) {

        switch (Ticket.getTicketType()) {

            case 'Screen_Region':
                //do stuff
                break;

        }

    }

}

function Ticket(id, ticketType) {


    this.id = id;
    this.ticketType = ticketType;

    this.getTicketType = function () {
        return this.ticketType;
    }

    this.getTicketId = function () {
        return this.id;
    }

}

function Processor() {

}