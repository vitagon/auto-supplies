package com.carssps.service;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;

import com.carssps.model.Role;
import com.carssps.model.User;

public interface UserService {
	User save(User user);
	List<User> findAll();
	void delete(Long id);
	User findOne(String username);
	User findById(Long id);
	Set<? extends GrantedAuthority> getAuthorities(Set<Role> roles);
}