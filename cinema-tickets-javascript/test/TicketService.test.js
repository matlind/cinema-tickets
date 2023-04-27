import TicketService from "../src/pairtest/TicketService.js";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException.js";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService.js";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";


jest.mock("../src/pairtest/lib/InvalidPurchaseException.js");
jest.mock("../src/thirdparty/seatbooking/SeatReservationService.js")
jest.mock("../src/thirdparty/paymentgateway/TicketPaymentService.js")

describe("TicketService", () => {

  it("should call the Payment service with the correct amount", () => {
    const childTicketRequest = new TicketTypeRequest("CHILD", 9);
      const adultTicketRequest = new TicketTypeRequest("ADULT", 8);
      const infantTicketRequest = new TicketTypeRequest("INFANT",2);
      const ticketService = new TicketService();
      ticketService.purchaseTickets(1234, childTicketRequest, adultTicketRequest, infantTicketRequest);
      const mockTicketPaymentServiceInstance = TicketPaymentService.mock.instances[0];
      expect(mockTicketPaymentServiceInstance.makePayment).toHaveBeenCalledWith(1234, 250);
  });

  it("should call the seat reservation service with the right amount", () => {
      const childTicketRequest = new TicketTypeRequest("CHILD", 9);
      const adultTicketRequest = new TicketTypeRequest("ADULT", 8);
      const infantTicketRequest = new TicketTypeRequest("INFANT",2);
      const ticketService = new TicketService();
      ticketService.purchaseTickets(1234, childTicketRequest, adultTicketRequest, infantTicketRequest);
      const mockSeatReservationServiceInstance = SeatReservationService.mock.instances[0];
      expect(mockSeatReservationServiceInstance.reserveSeat).toHaveBeenCalledWith(1234, 17);

  });

  describe("and when more than 20 tickets are purchased", () => {
    it("should throw an error", () => {
      const childTicketRequest = new TicketTypeRequest("CHILD", 9);
      const adultTicketRequest = new TicketTypeRequest("ADULT", 8);
      const infantTicketRequest = new TicketTypeRequest("INFANT", 6);
      const ticketService = new TicketService();
      try {
        ticketService.purchaseTickets(1234, childTicketRequest, adultTicketRequest, infantTicketRequest);
      } catch (e) {
        expect(e instanceof InvalidPurchaseException).toBeTruthy();
        const mockInvalidPurchaseExceptionInstance = InvalidPurchaseException.mock.instances[0];
        expect(mockInvalidPurchaseExceptionInstance.constructor).toHaveBeenCalledWith("Only a maximum of 20 tickets that can be purchased at a time");
      }
    });
  });

  describe("and when there is no adult present", () => {
    it("should throw an error", () => {
      const childTicketRequest = new TicketTypeRequest("CHILD", 9);
      const infantTicketRequest = new TicketTypeRequest("INFANT", 6);
      const ticketService = new TicketService();
      try {
        ticketService.purchaseTickets(1234, childTicketRequest, infantTicketRequest);
      } catch (e) {
        expect(e instanceof InvalidPurchaseException).toBeTruthy();
        const mockInvalidPurchaseExceptionInstance = InvalidPurchaseException.mock.instances[0];
        expect(mockInvalidPurchaseExceptionInstance.constructor).toHaveBeenCalledWith("Child and Infant tickets cannot be purchased without purchasing an Adult ticket");
      }
    });
  });
});



