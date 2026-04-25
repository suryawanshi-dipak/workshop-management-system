package com.workshop.customer.controller;

import com.workshop.customer.entity.Customer;
import com.workshop.customer.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(service.findAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable("id") Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Customer customer) {
        try {
            customer.setId(null);
            Customer saved = service.save(customer);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving customer: " + e.getMessage());
        }
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Long id, @RequestBody Customer customer) {
        try {
            if (service.findById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            customer.setId(id);
            Customer updated = service.save(customer);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating customer: " + e.getMessage());
        }
    }

    // SEARCH
    @GetMapping("/search")
    public ResponseEntity<List<Customer>> search(@RequestParam String q){
        return ResponseEntity.ok(service.search(q));
    }

    // COUNT
    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(service.count());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
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