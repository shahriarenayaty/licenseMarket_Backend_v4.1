import { Middleware } from "./Router";

class TrieNode {
  children: { [key: string]: TrieNode } = {};
  handlers: Middleware[] | null = null;
  paramName: string | null = null;
}

export class RouteTrie {
  root: TrieNode = new TrieNode();

  insert(method: string, path: string, handlers: Middleware[]) {
    const segments = [method, ...path.split("/").filter(Boolean)];
    let currentNode = this.root;

    for (const segment of segments) {
      if (segment.startsWith(":")) {
        if (!currentNode.children[":"]) {
          currentNode.children[":"] = new TrieNode();
        }
        currentNode = currentNode.children[":"];
        currentNode.paramName = segment.slice(1);
      } else {
        if (!currentNode.children[segment]) {
          currentNode.children[segment] = new TrieNode();
        }
        currentNode = currentNode.children[segment];
      }
    }

    currentNode.handlers = handlers;
  }

  search(method: string, path: string) {
    const segments = [method, ...path.split("/").filter(Boolean)];
    let currentNode = this.root;
    const params: { [key: string]: string } = {};

    for (const segment of segments) {
      if (currentNode.children[segment]) {
        currentNode = currentNode.children[segment];
      } else if (currentNode.children[":"]) {
        currentNode = currentNode.children[":"];
        if (currentNode.paramName) {
          params[currentNode.paramName] = segment;
        }
      } else {
        return null;
      }
    }

    if (currentNode.handlers) {
      return { handlers: currentNode.handlers, params };
    }

    return null;
  }
}
