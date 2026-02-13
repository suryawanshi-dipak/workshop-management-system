package com.workshop.customer.controller;

import com.workshop.customer.entity.Customer;
import com.workshop.customer.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    // GET ALL CUSTOMERS
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(service.findAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE OR UPDATE
    @PostMapping
    public ResponseEntity<?> save(@RequestBody Customer customer) {
        try {
            Customer saved = service.save(customer);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving customer: " + e.getMessage());
        }
    }

    // SEARCH
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String license) {

        if ((phone == null || phone.trim().isEmpty()) && 
            (license == null || license.trim().isEmpty())) {
            return ResponseEntity.badRequest()
                    .body("Please provide either phone or license number");
        }

        return service.search(phone, license)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (service.findById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            service.delete(id);
            return ResponseEntity.ok().body("Customer deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting customer: " + e.getMessage());
        }
    }
}