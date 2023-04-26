import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';

export default class TicketService {

  #INFANT_PRICE = 0;
  #CHILD_PRICE = 10;
  #ADULT_PRICE = 20;
  #MAX_TICKET_PER_PURCHASE = 20;
  
  #count_tickets = 0;
  #count_seats = 0;
  #total_price = 0;
  #adult_present = false;

  /**
   * @param {TicketTypeRequest} request
   * @throw {InvalidPurchaseException} When the ticket type is invalid
   */
  #updateTicketPrice(request) {
    let price = 0;
    switch (request.getTicketType()) {
        case 'INFANT':
            price = this.#INFANT_PRICE;
            break;
        case 'CHILD':
            price = this.#CHILD_PRICE;
            break;
        case 'ADULT':
            price = this.#ADULT_PRICE;
            break;
        default:
            throw new InvalidPurchaseException('Invalid ticket type')
    }
    this.#total_price += (request.getNoOfTickets() * price);
  } 

  /**
   * @param {TicketTypeRequest} request
   */
  #updateSeatCount(request) {
    const numTickets = request.getNoOfTickets();
    const requestType = request.getTicketType();

    if(requestType === "ADULT" || requestType === "CHILD") {
      this.#count_seats += numTickets;
    }

    if(requestType === "ADULT") {
      this.#adult_present = true;
    }
  }

  /**
   * @param {TicketTypeRequest} request
   * @throws {InvalidPurchaseException}
   */
  #updateTicketCount(request) {
    const numTickets = request.getNoOfTickets();
    
    this.#count_tickets += numTickets;
    if (this.#count_tickets > 20) {
      throw new InvalidPurchaseException("Only a maximum of 20 tickets that can be purchased at a time")
    }
  }

  /**
   * Should only have private methods other than the one below.
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!Number.isInteger(accountId)) {
      throw new TypeError('accountId must be an integer');
    } else if (accountId <= 0) {
      throw new InvalidPurchaseException('accountId must be greater than zero');
    } 

    ticketTypeRequests.forEach((request) => {
      if(!request instanceof TicketTypeRequest) {
        throw new TypeError('request is not of type TicketTypeRequest');
      }

      if(request.getNoOfTickets() <= 0) {
        throw new InvalidPurchaseException("Number of tickets must be greater than 0")
      }

      this.#updateSeatCount(request);
      this.#updateTicketCount(request);
      this.#updateTicketPrice(request);
    });
    
    if(!this.#adult_present) {
      throw new InvalidPurchaseException("Child and Infant tickets cannot be purchased without purchasing an Adult ticket");
    }
    
    const seatReservationService = new SeatReservationService();
    seatReservationService.reserveSeat(accountId, this.#count_seats);
    const ticketPaymentService = new TicketPaymentService();
    ticketPaymentService.makePayment(accountId, this.#total_price);

    console.log(`Total number of tickets purchased: ${this.#count_tickets}`);
  }
}